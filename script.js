// Получаем доступ к аудио-данным через Web Audio API
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);

        microphone.connect(analyser);
        analyser.fftSize = 256;

        const frequencyData = new Uint8Array(analyser.frequencyBinCount);

        // Функция для определения ноты
        function detectNote(frequency) {
            const notes = {
                'E': 329.63,
                'A': 440.00,
                'D': 293.66,
                'G': 392.00,
                'B': 246.94,
                'E2': 659.26
            };

            for (const note in notes) {
                if (Math.abs(frequency - notes[note]) < 10) {
                    return note;
                }
            }

            return null;
        }

        // Функция для обработки аудио-данных
        function processAudio() {
            requestAnimationFrame(processAudio);

            analyser.getByteFrequencyData(frequencyData);

            const peakIndex = frequencyData.indexOf(Math.max(...frequencyData));
            const frequency = peakIndex * audioContext.sampleRate / analyser.fftSize;

            const note = detectNote(frequency);

            if (note) {
                document.getElementById('note-display').innerText = `Нота: ${note}`;
            } else {
                document.getElementById('note-display').innerText = 'Нота не определена';
            }
        }

        // Начинаем обработку аудио-данных
        processAudio();

        // Добавляем обработчики для кнопок
        document.getElementById('start-button').addEventListener('click', () => {
            microphone.connect(analyser);
        });

        document.getElementById('stop-button').addEventListener('click', () => {
            microphone.disconnect();
        });
    })
    .catch(error => console.error(error));