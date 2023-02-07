// Criar um contexto de áudio
const audioContext = new AudioContext();

// Obter o fluxo de mídia (microfone)
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    // Conectar o fluxo de mídia ao contexto de áudio
    const source = audioContext.createMediaStreamSource(stream);

    // Criar um analisador de frequência
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    // Inicializar um array para armazenar os dados da frequência
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // Loop para atualizar os dados da frequência
    const update = () => {
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
      const pitch = maxIndex * audioContext.sampleRate / analyser.fftSize;

      // Transformar a frequência em uma nota musical
      const note = getNoteFromPitch(pitch);
      console.log("Nota:", note);

      // Repetir a atualização
      requestAnimationFrame(update);
    };
    update();
  });

// Função para transformar a frequência em uma nota musical
function getNoteFromPitch(pitch) {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const noteIndex = 12 * (Math.log(pitch / 440) / Math.log(2));
  return notes[Math.round(noteIndex) % 12];
}
