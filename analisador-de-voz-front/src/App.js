import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";

// Função para transformar a frequência em uma nota musical
function getNoteFromPitch(pitch) {
  const notes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const noteIndex = 12 * (Math.log(pitch / 440) / Math.log(2));
  return notes[Math.round(noteIndex) % 12];
}

function App() {
  const [streamActive, setStreamActive] = useState();
  const [stream, setStream] = useState();
  const [intervalId, setIntervalId] = useState();
  const [pitch, setPitch] = useState();

  function setStreamOn() {
    setStreamActive(true);
    action();
  }

  function setStreamOff() {
    setStreamActive(false);
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    clearInterval(intervalId);
    setPitch("");
  }

  function action() {
    // Criar um contexto de áudio
    const audioContext = new AudioContext();

    // Obter o fluxo de mídia (microfone)
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setStream(stream);
      // Conectar o fluxo de mídia ao contexto de áudio
      const source = audioContext.createMediaStreamSource(stream);

      // Criar um analisador de frequência
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

      // Inicializar um array para armazenar os dados da frequência
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);

      const intervalId = setInterval(() => {
        analyser.getByteFrequencyData(frequencyData);

        // Encontrar a frequência mais alta
        let maxFrequency = 0;
        let maxIndex = 0;
        for (let i = 0; i < frequencyData.length; i++) {
          if (frequencyData[i] > maxFrequency) {
            maxFrequency = frequencyData[i];
            maxIndex = i;
          }
        }

        // Calcular a frequência real
        const pitch = (maxIndex * audioContext.sampleRate) / analyser.fftSize;

        // Transformar a frequência em uma nota musical
        const note = getNoteFromPitch(pitch);
        setPitch(note);
      }, 50);
      setIntervalId(intervalId);
    });
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "10em",
        }}
      >
        {pitch}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "50px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {!streamActive ? (
          <div className="App">
            <button onClick={setStreamOn}>Start</button>
          </div>
        ) : (
          <div className="App">
            <button onClick={setStreamOff}>Stop</button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
