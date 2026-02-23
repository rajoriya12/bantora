let hamburger = document.querySelector(".hamburger");
let sidebar = document.querySelector("#library");
let closeBtn = document.querySelector(".close-btn");
let box = document.querySelector(".box");
let btns = document.querySelector("#btns");
let logoSection = document.querySelector(".logo");

let currentAudio = new Audio();
let songs;
let currfolder;


// MOBILE MENU

function handleMobileMenu() {
    if (window.innerWidth <= 865) {
        sidebar.appendChild(box);
    } else {
        logoSection.appendChild(box);
        document.querySelector(".header").appendChild(btns);
    }
}

window.addEventListener("resize", handleMobileMenu);
handleMobileMenu();

hamburger.addEventListener("click", function () {
    sidebar.classList.add("active");
});

closeBtn.addEventListener("click", function () {
    sidebar.classList.remove("active");
});

// HELPER FUNCTION

function cleanSongName(track) {
    return track
        .split("/")
        .pop()
        .replaceAll("-", " ")
        .replaceAll(".mp3", "")
        .replaceAll("_", " ")
        .replaceAll("(PagalWorldi.com.co)", " ")
        .replaceAll("%E2%80%99t Worry I%E2%80%99ll", "")
        .replaceAll("(KoshalWorld.Com)", "")
        .replaceAll("%20", "")
        .replaceAll("(mp3.pm)", "")
        .replaceAll("%E0%A4%A8", "")
        .replaceAll("HindiRapsong2021", "")
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;

    return mins + ":" + secs;
}

//  FETCH SONGS
async function getsong(folder) {
    currfolder = folder + "/";
    let res = await fetch(folder+"/playlist.json");
    let data = await res.json();
    return data;
}


async function displaysongslist() {

    let cardContener = document.querySelector(".cardContener");

    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let ass = div.getElementsByTagName("a");

    cardContener.innerHTML = "";

    for (let e of ass) {

        if (e.href.includes("/songs/")) {

            let songsfonder = e.href.split("/").slice(-2)[0];

            if (songsfonder === "songs") continue;

            let res = await fetch(`http://127.0.0.1:3000/songs/${songsfonder}/info.json`);
            let data = await res.json();

            console.log(data);

            cardContener.innerHTML += `
                <div class="card" data-folder="${songsfonder}">
                    <img src="/songs/${songsfonder}/cover.jpeg" alt="">
                    <div class="playBtn">▶</div>
                    <h3>${data.tital}</h3>
                    <p>${data.des}</p>
                </div>`;
        }
    }


    document.querySelectorAll(".card").forEach(function (card) {

        card.addEventListener("click", async function () {

            let folder = card.dataset.folder;
            if (!folder) return;

            currfolder = "songs/" + folder;
            songs = await getsong(currfolder);

            let songUL = document.querySelector(".songslist ul");
            songUL.innerHTML = "";

            for (let i = 0; i < songs.length; i++) {

                songUL.innerHTML += `
    <li class="flex" data-song="${songs[i]}">
        <img src="song.svg" alt="song">

        <div class="songinfo">
            <h3>${cleanSongName(songs[i])}</h3>
            <p>song artist</p>
        </div>

        <div class="hexa flex alingitem">
            <span>Play Now</span>
            <img src="play.svg" alt="play">
        </div>
    </li>`;
            }

            // ✅ LISTENER LOOP KE BAAD
            document.querySelectorAll(".songslist li").forEach(function (item) {

                item.addEventListener("click", function () {

                    let track = item.dataset.song;

                    currentAudio.src = currfolder + track.replace("/", "");
                    currentAudio.play();
                    play.src = "pause.svg";

                    document.querySelector(".playbar .songinfo").innerHTML =
                        cleanSongName(track);
                });

        });

        }


       )});

};

// MAIN

async function main() {
    songs = await getsong("songs/playlist");

    let songUL = document.querySelector(".songslist ul");
    songUL.innerHTML = "";

    let html = "";

    for (let i = 0; i < songs.length; i++) {

        html += `
        <li class="flex" data-song="${songs[i]}">
            <img src="song.svg" alt="song">
            <div class="songinfo">
                <h3>${cleanSongName(songs[i])}</h3>
                <p>song artist</p>
            </div>
            <div class="hexa flex alingitem">
                <span>Play Now</span>
                <img src="play.svg" alt="play">
            </div>
        </li>`;
    }

    songUL.innerHTML = html;

    // SONG CLICK
    document.querySelectorAll(".songslist li").forEach(function (item) {

        item.addEventListener("click", function () {

            let track = item.dataset.song;

            currentAudio.src = currfolder + track.replace("/", "");

            currentAudio.play();

            play.src = "pause.svg";

            document.querySelector(".playbar .songinfo").innerHTML =
                cleanSongName(track);

            document.querySelector(".songtime").innerHTML = "00:00/00:00";
        });

    });


    // PLAY BUTTON
    play.addEventListener("click", function () {

        if (currentAudio.paused) {
            currentAudio.play();
            play.src = "pause.svg";
        } else {
            currentAudio.pause();
            play.src = "play.svg";
        }
    });

    // TIME UPDATE
    currentAudio.addEventListener("timeupdate", function () {

        if (!isNaN(currentAudio.duration)) {

            let percent = (currentAudio.currentTime / currentAudio.duration) * 100;

            document.querySelector(".circal").style.left = percent + "%";

            document.querySelector(".seekbaar").style.background =
                "linear-gradient(to right, red " + percent + "%, #ddd " + percent + "%)";

            document.querySelector(".songtime").innerHTML =
                formatTime(currentAudio.currentTime) + "/" +
                formatTime(currentAudio.duration);
        }
    });

    // SEEK CLICK
    document.querySelector(".seekbaar").addEventListener("click", function (e) {

        let seekbar = document.querySelector(".seekbaar");
        let rect = seekbar.getBoundingClientRect();

        let clickPosition = e.clientX - rect.left;
        let percent = clickPosition / rect.width;

        if (currentAudio.duration) {
            currentAudio.currentTime = percent * currentAudio.duration;
        }
    });


    // PREVIOUS
    document.querySelector("#previous").addEventListener("click", function () {

        let currentSong = "/" + currentAudio.src.split("/").pop();
        let index = songs.indexOf(currentSong);

        if (index > 0) {

            currentAudio.src = currfolder + songs[index - 1].replace("/", "");

            currentAudio.play();
            play.src = "pause.svg";

            document.querySelector(".playbar .songinfo").innerHTML =
                cleanSongName(songs[index - 1]);
        }
    });


    // NEXT
    document.querySelector("#next").addEventListener("click", function () {

        let currentSong = "/" + currentAudio.src.split("/").pop();
        let index = songs.indexOf(currentSong);

        if (index < songs.length - 1) {

            currentAudio.src = currfolder + songs[index + 1].replace("/", "");

            currentAudio.play();
            play.src = "pause.svg";

            document.querySelector(".playbar .songinfo").innerHTML =
                cleanSongName(songs[index + 1]);
        }
    });

    //volum 

    let volum = document.querySelector('.vol')
    let volrange = document.querySelector('.volrange')

    volum.addEventListener("click", () => {
        volrange.classList.toggle("hidden")
    })

    volrange.addEventListener("input", () => {
        currentAudio.volume = volrange.value
    })

    // AUTO NEXT
    currentAudio.addEventListener("ended", function () {

        let currentFile = decodeURIComponent(currentAudio.src.split("/").pop());

        let index = -1;

        for (let i = 0; i < songs.length; i++) {
            if (songs[i].includes(currentFile)) {
                index = i;
                break;
            }
        }

        if (index != -1 && index < songs.length - 1) {

            currentAudio.src = currfolder + songs[index + 1].replace("/", "");

            currentAudio.play();
            play.src = "pause.svg";

            document.querySelector(".playbar .songinfo").innerHTML =
                cleanSongName(songs[index + 1]);
        }
    });


    // INITIAL LOAD
    if (songs.length > 0) {

        currentAudio.src = currfolder + songs[0].replace("/", "");

        currentAudio.pause();
        play.src = "play.svg";

        document.querySelector(".playbar .songinfo").innerHTML =
            cleanSongName(songs[0]);
    }



    //find song
    let searchInput = document.querySelector(".box input");

    searchInput.addEventListener("input", function () {

        let searchValue = searchInput.value.toLowerCase();

        document.querySelectorAll(".songslist li").forEach(function (item) {

            let songName = item.querySelector("h3").innerText.toLowerCase();

            if (songName.includes(searchValue)) {
                item.style.display = "flex";
            } else {
                item.style.display = "none";
            }

        });

    });
    // displaysongslist()

}

main();
