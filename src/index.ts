// Exemplo de uso:

import { DeepgramRecorder } from "./managers/deepgram.manager";

const recorder = new DeepgramRecorder(process.env.DEEPGRAM_API_KEY!);

recorder.on("ready", (message) => {
  console.log(message);
});

recorder.on("transcript", (alternatives) => {});

recorder.on("error", (error) => {
  console.error("Erro:", error);
});

recorder.on("stopping", (message) => {
  console.log(message);
});

recorder.on("stopped", (message) => {
  console.log(message);
});

recorder.start();
