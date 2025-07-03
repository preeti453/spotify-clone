console.log("Let's start JavaScript code");

let current_songs = new Audio(); // Audio player instance
let songs; // Holds list of songs
let curFolder; // Folder currently playing

// Converts seconds to MM:SS
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(Math.floor(seconds % 60)).padStart(2, "0");
    return `${minutes}:${secs}`;
}

// Fetch songs from a given folder
async function getSongs(folder) {
    curFolder = folder;
    let res = await fetch(`${folder}/`);
    let html = await res.text();
    let div = document.createElement("div");
    div.innerHTML = html;
    let anchors = div.getElementsByTagName("a");

    songs = [];
    for (const a of anchors) {
        if (a.href.endsWith(".mp3")) {
            let songFile = a.href.split(`${folder}/`)[1];
            songs.push(songFile);
        }
    }

    // Render song list
    let songList = document.querySelector(".songlist ul");
    songList.innerHTML = "";
    for (const song of songs) {
        songList.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg" alt="music">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div></div>
            </div>
            <div class="playnow">
                <span>play now</span>
            </div>
            <img src="img/play.svg" alt="play">
        </li>`;
    }

    // Add click listener to songs
    document.querySelectorAll(".songlist li").forEach((el) => {
        el.addEventListener("click", () => {
            let track = el.querySelector(".info div").innerHTML.trim();
            playmusic(track);
        });
    });

    return songs;
}

// Play music by track name
function playmusic(track, pause = false) {
    current_songs.src = `${curFolder}/${track}`;
    if (!pause) {
        current_songs.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

// Display all album cards dynamically
async function displayAlbumns() {
    let res = await fetch("songs/");
    let html = await res.text();
    let div = document.createElement("div");
    div.innerHTML = html;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container");
    cardContainer.innerHTML = "";

    for (let a of anchors) {
        if (a.href.includes("/songs")) {
            let cleanHref = a.getAttribute("href").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
            let folderPath = `songs/${cleanHref.split("/").filter(Boolean).pop()}`;

            try {
                let meta = await fetch(`${folderPath}/info.json`);
                let data = await meta.json();

                cardContainer.innerHTML += `
                <div data-folder="${folderPath}" class="card">
                    <div class="green">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                            <circle cx="20" cy="20" r="18" fill="#1fdf64" />
                            <polygon points="16,13 27,20 16,27" fill="black" />
                        </svg>
                    </div>
                    <img src="${folderPath}/image.jpg" alt=""/>
                    <h2>${data.title}</h2>
                    <p>${data.Description}</p>
                </div>`;
            } catch (err) {
                console.error(`Failed to fetch metadata from ${folderPath}`);
            }
        }
    }

    // Add click listeners to each card
    document.querySelectorAll(".card").forEach((el) => {
        el.addEventListener("click", async () => {
            let folder = el.getAttribute("data-folder");
            songs = await getSongs(folder);
            playmusic(songs[0]);
        });
    });
}

// Main app entry
async function main() {
    await getSongs("songs/ncs");
    playmusic(songs[0], true);
    await displayAlbumns();

    play.addEventListener("click", () => {
        if (current_songs.paused) {
            current_songs.play();
            play.src = "img/pause.svg";
        } else {
            current_songs.pause();
            play.src = "img/play.svg";
        }
    });

    current_songs.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(current_songs.currentTime)}/${secondsToMinutesSeconds(current_songs.duration)}`;
        document.querySelector(".circle").style.left = `${(current_songs.currentTime / current_songs.duration) * 100}%`;
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        current_songs.currentTime = (current_songs.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(current_songs.src.split("/").pop());
        if (index > 0) playmusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(current_songs.src.split("/").pop());
        if (index + 1 < songs.length) playmusic(songs[index + 1]);
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        current_songs.volume = e.target.value / 100;
        document.querySelector(".volume>img").src = current_songs.volume > 0 ? "img/volume.svg" : "img/mute.svg";
    });

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            current_songs.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            current_songs.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
