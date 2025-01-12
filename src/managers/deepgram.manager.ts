import {
  createClient,
  ListenLiveClient,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { spawn } from "child_process";
import dotenv from "dotenv";
import { EventEmitter } from "events";
// @ts-ignore
import Microphone from "node-microphone";
import * as path from "path";
import { Writable } from "stream";
import { detectHeroService } from "../services/detect-hero/detect-hero.service";
import { detectSkillService } from "../services/detect-skill/detect-skill.service";

dotenv.config();

export class DeepgramRecorder extends EventEmitter {
  private deepgram;
  private connection: ListenLiveClient | undefined;
  private mic: Microphone;
  private audioBuffer: Buffer;
  private filePath: string;

  constructor(apiKey: string) {
    super();
    this.deepgram = createClient(apiKey);
    this.audioBuffer = Buffer.alloc(0);
    this.filePath = path.join(process.cwd(), "gravacao.wav");
  }

  public start(): void {
    this.connection = this.deepgram.listen.live({
      model: "nova-2",
      language: "pt-BR",
      smart_format: true,
      encoding: "linear16",
      sample_rate: 32000,
      channels: 1,
      keywords: ["cristal", "rampi", "pablito", "ursula", "fred"],
    });

    this.setupConnectionListeners();
    this.startRecording();
  }

  private setupConnectionListeners(): void {
    this.connection?.on(LiveTranscriptionEvents.Open, () => {
      this.emit(
        "ready",
        "Conexão com Deepgram estabelecida. Iniciando captura de áudio..."
      );
    });

    this.connection?.on(LiveTranscriptionEvents.Close, () => {
      this.emit("close", "Conexão com Deepgram fechada.");
    });

    this.connection?.on(LiveTranscriptionEvents.Transcript, async (data) => {
      this.emit("transcript", data.channel.alternatives);
      const transcript = data.channel.alternatives[0].transcript;
      if (!transcript) return;
      console.log("transcript => => => ", transcript);
      const skill = await detectSkillService(transcript);
      console.log("skill", skill);
      const hero = await detectHeroService(transcript);
      console.log("hero", hero);
    });

    this.connection?.on(LiveTranscriptionEvents.Error, (err) => {
      this.emit("error", err);
    });
  }

  private startRecording(): void {
    this.mic = new Microphone();
    const micStream = this.mic.startRecording();

    const sox = spawn("sox", [
      "-t",
      "raw",
      "-r",
      "16000",
      "-b",
      "16",
      "-c",
      "1",
      "-e",
      "signed",
      "-L",
      "-",
      "-t",
      "wav",
      this.filePath,
    ]);

    sox.stderr.on("data", (data) => {
      this.emit("error", `Erro do SOX: ${data.toString()}`);
    });

    const audioProcessor = new Writable({
      write: (chunk, encoding, callback) => {
        this.audioBuffer = Buffer.concat([this.audioBuffer, chunk]);
        this.connection?.send(chunk);
        sox.stdin.write(chunk);
        callback();
      },
    });

    micStream.pipe(audioProcessor);

    micStream.on("error", (error: any) => {
      this.emit("error", `Erro no microfone: ${error}`);
      this.stop();
    });

    process.on("SIGINT", () => this.stop());
  }

  public stop(): void {
    this.emit("stopping", "Parando captura de áudio...");

    if (this.mic) {
      this.mic.stopRecording();
    }

    if (this.connection) {
      this.connection?.finish();
    }

    this.emit("stopped", `Áudio salvo em: ${this.filePath}`);
  }
}
