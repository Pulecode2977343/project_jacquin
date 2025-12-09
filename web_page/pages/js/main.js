const notes = {
			'C': 261.63,
			'C#': 277.18,
			'D': 293.66,
			'D#': 311.13,
			'E': 329.63,
			'F': 349.23,
			'F#': 369.99,
			'G': 392.00,
			'G#': 415.30,
			'A': 440.00,
			'A#': 466.16,
			'B': 493.88
        };
        

        // Inicializar contexto de audio
		const AudioContext = window.AudioContext || window.webkitAudioContext;
		const audioCtx = new AudioContext();

		function playNote(note) {
			const osc = audioCtx.createOscillator();
			osc.type = 'sine';
			osc.frequency.value = notes[note];
			const gain = audioCtx.createGain();
			gain.gain.value = 0.1;
			osc.connect(gain);
			gain.connect(audioCtx.destination);
			osc.start();
			setTimeout(() => {
				osc.stop();
			}, 350);
		}

        // Evento para reproducir sonido al pasar el mouse
		document.querySelectorAll('.key').forEach(key => {
			key.addEventListener('mouseenter', e => {
				const note = key.getAttribute('data-note');
				playNote(note);
			});
		});

// Menú hamburguesa
const menuBtn = document.getElementById('menuBtn');
const iconLinks = document.getElementById('iconLinks');

menuBtn.addEventListener('click', () => {
    iconLinks.classList.toggle('active');
    if (iconLinks.classList.contains('active')) {
        menuBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
        </svg>`;
        menuBtn.setAttribute('aria-expanded', 'true');
    } else {
        menuBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
        <path class="icon icon-menu" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
        </svg>`;
        menuBtn.setAttribute('aria-expanded', 'false');
    }

});
