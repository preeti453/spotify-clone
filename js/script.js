console.log("Lets start javascript code");
let current_songs = new Audio(); // Creates an audio player object in JS.
let songs; // Will hold the list of song file names.
let curFolder; // Stores the current folder from which songs are being played.

// Convert Seconds to "MM:SS" Format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Fetch Songs from Folder
async function getSongs(folder) {
    curFolder = folder;
    let a = await fetch(`${folder}/`); // changed
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all songs in the playlist
    let songsUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songsUL.innerHTML = "";
    for (const song of songs) {
        songsUL.innerHTML =
            songsUL.innerHTML +
            `                  
                <li>
                    <img class="invert" src="img/music.svg" alt="music player">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div></div>
                    </div>
                    <div class="playnow">
                        <span>play now</span>
                    </div>
                    <img src="img/play.svg" alt="play now">
                </li>`;
    }

    // Attach event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", (element) => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML).trim();
        });
    });

    return songs;
}

const playmusic = (track, pause = false) => {
    current_songs.src = `${curFolder}/` + track; // changed
    if (!pause) {
        current_songs.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbumns() {
    let a = await fetch(`songs/`); // changed
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            // Get the metadata of the folder
            let a = await fetch(`songs/${folder}/info.json`); // changed
            let response = await a.json();

            cardContainer.innerHTML =
                cardContainer.innerHTML +
                `<div data-folder="${folder}" class="card">
                <div class="green">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18" fill="#1fdf64" />
                        <polygon points="16,13 27,20 16,27" fill="black" />
                    </svg>
                </div>
                <img src="songs/${folder}/image.jpg" alt=""/>
                <h2>${response.title}</h2>
                <p>${response.Description}</p>
            </div>`;
        }
    }

    // load the folder whenever a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0]);
        });
    });
}

async function main() {
    // get the list of all the songs
    await getSongs("songs/ncs");
    playmusic(songs[0], true);

    // display all the albums on the page
    displayAlbumns();

    // attach an event listener to previous, play and next buttons
    play.addEventListener("click", () => {
        if (current_songs.paused) {
            current_songs.play();
            play.src = "img/pause.svg";
        } else {
            current_songs.pause();
            play.src = "img/play.svg";
        }
    });

    // listen to time update
    current_songs.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
            current_songs.currentTime
        )}/${secondsToMinutesSeconds(current_songs.duration)}`;
        document.querySelector(".circle").style.left =
            (current_songs.currentTime / current_songs.duration) * 100 + "%";
    });

    // add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        current_songs.currentTime = (current_songs.duration * percent) / 100;
    });

    // add event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // add event listener to close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // add event listener to previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(current_songs.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    // add event listener to next
    next.addEventListener("click", () => {
        current_songs.pause();
        let index = songs.indexOf(current_songs.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    // add event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        current_songs.volume = parseInt(e.target.value) / 100;
        if (current_songs.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
    });

    // add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            current_songs.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            current_songs.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();
