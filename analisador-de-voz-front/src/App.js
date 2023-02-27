import "./App.css";
import { useState } from "react";

// const audioContext = new AudioContext();

// // Get the audio stream from the microphone
// navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(stream) {
//   // Create an audio source from the stream
//   var source = audioContext.createMediaStreamSource(stream);

//   // Create a real-time analyser
//   var analyser = audioContext.createAnalyser();
//   source.connect(analyser);

//   // Create arrays to hold the frequency and time domain data
//   var frequencyData = new Uint8Array(analyser.frequencyBinCount);
//   var timeDomainData = new Uint8Array(analyser.frequencyBinCount);

//   // Continuously update the frequency and time domain data
//   function update() {
//     analyser.getByteFrequencyData(frequencyData);
//     analyser.getByteTimeDomainData(timeDomainData);

//     // Calculate the average amplitude
//     var amplitude = 0;
//     for (var i = 0; i < timeDomainData.length; i++) {
//       amplitude += timeDomainData[i];
//     }
//     amplitude /= timeDomainData.length;

//     // Compare the frequency data with reference spectrums
//     // ...

//     // Determine the timbre
//     // ...

//     console.log("Amplitude:", amplitude);
//     console.log("Timbre:", timbre);

//     requestAnimationFrame(update);
//   }

//   update();
// });


const MIN_FREQUENCY = 0;
const MAX_FREQUENCY = 1000;

function frequencyToColor(frequency) {
  // Map the frequency to a value between 0 and 1
  var normalizedFrequency =
    (frequency - MIN_FREQUENCY) / (MAX_FREQUENCY - MIN_FREQUENCY);

  // Convert the value to a hue in the HSL color space
  var hue = normalizedFrequency * 180;

  // Return the HSL color as a string
  return "hsl(" + hue + ", 100%, 50%)";
}

// Função para transformar a frequência em uma nota musical
function getNoteFromPitch(pitch) {
  const notes = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
  ];
  const noteIndex = 12 * (Math.log(pitch / 440) / Math.log(2));
  return notes[Math.round(noteIndex) % 12];
}

function App() {
  const [streamActive, setStreamActive] = useState();
  const [stream, setStream] = useState();
  const [intervalId, setIntervalId] = useState();
  const [pitch, setPitch] = useState();
  const [backgroundColor, setBackgroundColor] = useState();

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
      const timeDomainData = new Uint8Array(analyser.frequencyBinCount);

      // Continuously update the frequency and time domain data
      function update() {
        analyser.getByteFrequencyData(frequencyData);
        analyser.getByteTimeDomainData(timeDomainData);

        // Calculate the average amplitude
        var amplitude = 0;
        for (var i = 0; i < timeDomainData.length; i++) {
          amplitude += timeDomainData[i];
        }
        amplitude /= timeDomainData.length;

        // Compare the frequency data with reference spectrums
        // ...

        // Determine the timbre
        // ...

        console.log("Amplitude:", amplitude);
        // console.log("Timbre:", timbre);

        requestAnimationFrame(update);
      }

      update();

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
        setBackgroundColor(frequencyToColor(pitch));

        // Transformar a frequência em uma nota musical
        const note = getNoteFromPitch(pitch);
        if (note) {
          setPitch(note);
        }
      }, 5);
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
          backgroundColor: backgroundColor,
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
