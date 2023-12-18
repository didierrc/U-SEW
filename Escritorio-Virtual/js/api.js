"use strict";

class Reproductor {

    constructor() {

        // El numero de pistas guardadas
        this.numberTracks = 0;
        // La pista a reproducir
        this.songToPlay = null;

        // Creando un nuevo contexto de Audio usando la API de Web Audio
        this.audioContext = new AudioContext();
        // Volume settings
        this.gainNode = this.audioContext.createGain();
        // Stereo settings
        this.panner = this.audioContext.createStereoPanner();
        // Mapeamos la cancion del <audio> con el contexto
        var track = this.audioContext.createMediaElementSource($("audio")[0]);
        track.connect(this.gainNode).connect(this.panner).connect(this.audioContext.destination);

        // Añadimos la funcionalidad de reproducir y pausar al boton.
        this.addPlayStopHandler();

        // Añadimos la funcionalidad de reproducir la cancion anterior al boton.
        this.addPreviousSongHandler();

        // Añadimos la funcionalidad de reproducir la cancion posterior al boton.
        this.addNextSongHandler();

        // Que hacer cuando la cancion finalize...
        this.addEndSongHandler();

        // Volume handler
        this.addVolumeHandler();

        // Stereo handler
        this.addStereoHandler();

        // Previniendo que se puedan droppear files en el window (con excepcion de nuestra zona definida)
        window.addEventListener("dragover", (event) => { event.preventDefault(); });
        window.addEventListener("drop", (event) => { event.preventDefault(); });

        // Define drop zone
        this.defineDropZone();
    }

    addVolumeHandler() {

        var volumeControl = $("main>section>section:first input[type='range']");

        volumeControl.on("input", () => {
            this.gainNode.gain.value = volumeControl.val();
            $("main>section>section:first>p:last").text(Math.floor(+volumeControl.val() * 100) + "%");
        });
    }

    addStereoHandler() {
        var stereoControl = $("main>section>section:last input[type='range']");

        stereoControl.on("input", () => {
            this.panner.pan.value = stereoControl.val();
        });
    }

    addNextSongHandler() {
        var nextButton = $("main>section>section:nth-of-type(3)>button:nth-of-type(3)");
        nextButton.on("click", () => {

            if (this.songToPlay == null) {
                alert("Selecciona una cancion!");
                return;
            }

            // Revisando si el contexto esta suspendido (Aparecen warnings en las DevTools ya que los navegadores
            // previenen cualquier reproduccion de sonido sin previa accion del usuario -> autoplay policy)
            if (this.audioContext.state === "suspended") {
                this.audioContext.resume();
            }

            var nextSong = this.songToPlay.next();
            if (nextSong.attr("data-song") != undefined) {

                // Pausamos la cancion actual
                this.pauseCurrentSong();

                // Cambiamos a la previa
                this.songToPlay = nextSong;
                this.changeAudioSrc(this.songToPlay.attr("data-song"));

                // Play a la nueva cancion
                this.playCurrentSong();
            } else {
                alert("No hay una siguiente canción!");
            }


        });
    }

    addPreviousSongHandler() {

        var previousButton = $("main>section>section:nth-of-type(3)>button:nth-of-type(1)");
        previousButton.on("click", () => {

            if (this.songToPlay == null) {
                alert("Selecciona una cancion!");
                return;
            }

            // Revisando si el contexto esta suspendido (Aparecen warnings en las DevTools ya que los navegadores
            // previenen cualquier reproduccion de sonido sin previa accion del usuario -> autoplay policy)
            if (this.audioContext.state === "suspended") {
                this.audioContext.resume();
            }

            var previousSong = this.songToPlay.prev();
            if (previousSong.attr("data-song") != undefined) {

                // Pausamos la cancion actual
                this.pauseCurrentSong();

                // Cambiamos a la previa
                this.songToPlay = previousSong;
                this.changeAudioSrc(this.songToPlay.attr("data-song"));

                // Play a la nueva cancion
                this.playCurrentSong();
            } else {
                alert("No hay una canción previa!");
            }


        });


    }

    changeAudioSrc(newSrc) {

        var audio = $("audio");
        if (audio.attr("src") != newSrc)
            audio.attr("src", newSrc);
    }

    pauseCurrentSong() {
        var playButton = $("main>section>section:nth-of-type(3)>button:nth-of-type(2)");
        var audioElement = $("audio")[0];
        if (this.songToPlay && playButton.attr("data-playing") === "true") {
            audioElement.pause();
            playButton.attr("data-playing", "false");
            playButton.text("Play");
            this.songToPlay.removeAttr("data-playingSong");
        }
    }

    playCurrentSong() {
        var playButton = $("main>section>section:nth-of-type(3)>button:nth-of-type(2)");
        var audioElement = $("audio")[0];
        if (this.songToPlay && playButton.attr("data-playing") === "false") {
            this.songToPlay.attr("data-playingSong", "true");
            playButton.text("Pause");
            audioElement.play();
            playButton.attr("data-playing", "true");
        }
    }


    addPlayStopHandler() {

        var playButton = $("main>section>section:nth-of-type(3)>button:nth-of-type(2)");
        playButton.on("click", () => {

            if (this.songToPlay == null) {
                alert("Selecciona una canción!");
                return;
            }

            // Revisando si el contexto esta suspendido (Aparecen warnings en las DevTools ya que los navegadores
            // previenen cualquier reproduccion de sonido sin previa accion del usuario -> autoplay policy)
            if (this.audioContext.state === "suspended") {
                this.audioContext.resume();
            }

            // Cambiando el source del audio
            var src = this.songToPlay.attr("data-song");
            this.changeAudioSrc(src);

            // Reproducimos o pausamos depende del estado
            if (playButton.attr("data-playing") === "false") {
                this.playCurrentSong();
            } else if (playButton.attr("data-playing") === "true") {
                this.pauseCurrentSong();
            }
        });

    }

    addEndSongHandler() {

        document.querySelector("audio").addEventListener("ended", () => {

            this.songToPlay.removeAttr("data-playingSong");
            this.songToPlay = null;
            $("audio").removeAttr("src");
            var playButton = $("main>section>section:nth-of-type(3)>button:nth-of-type(2)");
            playButton.text("Play");
            playButton.attr("data-playing", "false");
            // No se puede hacer Autoplay sin previa autorizacion del usuario

        }, false);
    }

    defineDropZone() {

        document.querySelector("main>section>section:nth-of-type(2)>section")
            .addEventListener("drop", this.addDroppedTrack.bind(this));

        // Deshabilitando que la accion por defecto del navegador cuando se arrastra un elemento o archivo del SO
        $("main>section>section:nth-of-type(2)>section").on("dragover", (ev) => { ev.preventDefault(); });
        $("main>section>section:nth-of-type(2)>section").on("dragenter", (ev) => { ev.preventDefault(); });
    }

    addTrackFile(files) {

        var musicFileType = /audio.*/;

        var addTrack = (file) => {

            if (!file.type.match(musicFileType)) {
                return;
            }

            var reader = new FileReader();
            reader.onload = (event) => {

                this.numberTracks += 1;
                var dataSong = "data-song='" + event.target.result + "'";
                $("main>section>section:nth-of-type(2)>section").append("<p " + dataSong + ">" + this.numberTracks + " - " + file.name + "</p>");
                this.addClickableSong($("main>section>section:nth-of-type(2)>section>p:last"));
            }
            reader.readAsDataURL(file); // Leemos la URL de la cancion
        }

        for (var i = 0; i < files.length; i++) {
            addTrack(files[i]);
        }
    }

    addDroppedTrack(ev) {

        var addTrack = (file) => {

            var reader = new FileReader();
            reader.onload = (event) => {

                this.numberTracks += 1;

                var dataSong = "data-song='" + event.target.result + "'";
                $("main>section>section:nth-of-type(2)>section").append("<p " + dataSong + ">" + this.numberTracks + " - " + file.name + "</p>");
                this.addClickableSong($("main>section>section:nth-of-type(2)>section>p:last"));
            }
            reader.readAsDataURL(file); // Leemos la URL de la cancion
        }

        console.log("File(s) dropped");

        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();

        var multimediaType = /audio.*/;

        // Usamos la interfaz DataTransferItemList para acceder a los archivos
        if (ev.dataTransfer.items) {

            [...ev.dataTransfer.items].forEach((item, i) => {
                // Chequeamos que los items sean files y multimedia
                if (item.kind === "file") {
                    var file = item.getAsFile();

                    if (file.type.match(multimediaType))
                        addTrack(file);

                }
            });
        } else {
            // Use DataTransfer interface to access the file(s)
            [...ev.dataTransfer.files].forEach((file, i) => {

                if (file.type.match(multimediaType))
                    addTrack(file);


            });
        }
    }

    addClickableSong(p) {
        p.on("click", (event) => {
            this.songToPlay = p;
        });
    }

}

var musica = new Reproductor();