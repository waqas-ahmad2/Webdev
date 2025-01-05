
console.log('let write js')

let currentSong = new Audio();
let song;
let currFolder;


function formatTime(timeInSeconds) {
    if(isNaN(timeInSeconds) || timeInSeconds<0){
        return "00:00"
    }
    else{
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

}

function initializeVolume() {
    const volume = currentSong.volume || 0.4; // Default to 1.0 if not set
    const volumeSlider = document.querySelector('.range').getElementsByTagName('input')[0];
    volumeSlider.value = volume * 100; // Update slider to match volume
    updateVolumeUI(volume); // Update the volume icon
}


async function getSong(folder){
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    song=[]
    for (let index = 0; index < as.length; index++) {
        const element = as[index]
        console.log(element)
        if(element.href.endsWith(".mp3")){
            song.push(element.href.split(`/${folder}/`)[1])
        }
    }
    
    let ul = document.getElementById('songs')
    ul.innerHTML = "" //to avoid apending songs in the same list when album is clicked
    if (song.length ==0){
        ul.innerHTML =   `<li>
        <div class="info">
            <div>No Songs to Play</div>
        </div>
  
        </li>`
    }
    else{
        for (let index = 0; index < song.length; index++) {
            // let li = document.createElement('li')
            const element = song[index]
            ul.innerHTML = ul.innerHTML +
                                `<li>
                                <img class="invert" src="img/music.svg">
                                <div class="info">
                                    <div id="name">${element.split(`/${folder}/`)[0]}</div>
                                    <div>Artist: Unknown</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img  class="invert" src="img/play.svg" alt="">
                                </div>
                                </li>`
        }
    }
    //attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click',element =>{
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())  //current song track
        })
    })

    return song
}


function playMusic(track,pause=false){
    if(track){
    //play the song
    currentSong.src =  `/${currFolder}/` + track
    if(!pause){
        currentSong.play();
        play.src = 'img/pause.svg'
    }

    document.querySelector('.songinfo').innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

    }
    else{
        currentSong.pause()
        currentSong.src = ''
        play.src = 'img/pause.svg'
        document.querySelector('.songinfo').innerHTML = ''
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00"        
        document.querySelector(".circle").style.left = 100+"%"
    }
}

async function displayAlbum() {
    let a = await fetch("/Songs/")
    let response = await a.text()
    let div = document.createElement('div')
    div.innerHTML = response
    let as = div.getElementsByTagName('a')
    let cardContainer = document.querySelector(".cardContainer")
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.includes("/Songs") && !element.href.includes(".htaccess")) {
            let folder = element.href.split('/').slice(-2)[0];
            let a = await fetch(`/Songs/${folder}/info.json`)
            response = await a.json()
            cardContainer.innerHTML +=
                    `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                                <!-- Outer Circle -->
                                <circle cx="100" cy="100" r="90" fill="none" stroke="white" stroke-width="10" />
                            
                                <!-- Play Symbol -->
                                <polygon points="80,60 140,100 80,140" fill="white" />
                            </svg>
                            
                        </div>
                        <img src="Songs/${folder}/cover.jpg">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
     
        }
    }
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
    e.addEventListener("click", async item => {
    song = await getSong(`Songs/${item.currentTarget.dataset.folder}`) 
    playMusic(song[0])
        })
    })    
}

async function main() {
    
    //list of all songs
    await getSong("Songs/ncs")
    playMusic(song[0],pause=true)
    
    initializeVolume()

    displayAlbum()
    
    //attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click',element =>{
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())  //current song track
        })
    })
    play.src ='img/play.svg'

    
    //attach an event listener to play button(used play id)
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = 'img/pause.svg'
        }

        else{
            currentSong.pause()
            play.src = 'img/play.svg'
        }
    })


    //attach an event listener to previous button
    previous.addEventListener("click",()=>{

        if(currentSong.src.split(`/${currFolder}/`)[1] == song[song.length-1].split(`/${currFolder}/`)[0]){
            playMusic(song[0])
        }
        else{
            let index = song.indexOf(currentSong.src.split(`/${currFolder}/`)[1])

            playMusic(song[song.length-1].split(`/${currFolder}/`)[0])
        }
    })


    //attach an event listener to next button
    next.addEventListener("click",()=>{

        //for only one songs repeat it 
        if(currentSong.src.split(`/${currFolder}/`)[1] == song[song.length-1].split(`/${currFolder}/`)[0]){
            playMusic(song[0])
        }
        //for more songs increase the index to play next
        else{
            let index = song.indexOf(currentSong.src.split(`/${currFolder}/`)[1])
            playMusic(song[index+1].split(`/${currFolder}/`)[0])
        }
    })

      

    //adding event listener for hamburger
    document.querySelector('.hamburger').addEventListener('click',()=>{
        document.querySelector('.left').style.left = 0 + "%"
    })

    document.querySelector('.close').addEventListener('click',()=>{
        document.querySelector('.left').style.left = -130 + "%"
    })

    
   
    


    //listen for timeupdate event (showing time and moving circle of seekbar)
    currentSong.addEventListener("timeupdate",()=>{

        let duration = document.querySelector('.songtime')
        duration.innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)} `
        document.querySelector(".circle").style.left = String((currentSong.currentTime)/(currentSong.duration)*100) +"%"

    })

    

    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");
    let isDragging = false;
    
    // Listen for seekbar position and change circle on click
    seekbar.addEventListener("mousedown", (e) => {
        const rect = seekbar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percent = (offsetX / rect.width) * 100;
        document.body.style.userSelect='none';
        isDragging = true;
    
        // Clamp the percentage between 0 and 100
        const clampedPercent = Math.max(0, Math.min(percent, 100));
        circle.style.left = clampedPercent + "%";
        currentSong.currentTime = (currentSong.duration * clampedPercent) / 100;
    });
    
    // Listen for mouse down on the circle
    circle.addEventListener("mousedown", (e) => {
        isDragging = true;
        document.body.style.userSelect = "none"; // Prevent text selection during drag
    });
    
    // Listen for mouse up to stop dragging
    document.addEventListener("mouseup", () => {
        isDragging = false;
        document.body.style.userSelect = "auto"; // Restore text selection
    });
    
    // Listen for mouse move to drag the circle
    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const rect = seekbar.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const percent = (offsetX / rect.width) * 100;
    
            // Clamp the percentage between 0 and 100
            const clampedPercent = Math.max(0, Math.min(percent, 100));
            circle.style.left = clampedPercent + "%";
            currentSong.currentTime = (currentSong.duration * clampedPercent) / 100;
        }
    })
    
      
}

// Function to update the volume icon and volume slider
function updateVolumeUI(volume) {
    const volumeImg = document.querySelector('.volume').getElementsByTagName('img')[0];
    if (volume === 0) {
        volumeImg.src = 'img/mute.svg';
    } else if (volume > 0.6) {
        volumeImg.src = 'img/loud.svg';
    } else {
        volumeImg.src = 'img/volume.svg';
    }
    
    // Update the volume range slider
    document.querySelector('.range').getElementsByTagName('input')[0].value = volume * 100;
}

// Adding event listener to volume range
document.querySelector('.range').getElementsByTagName('input')[0].addEventListener("change", e => {
    const volume = e.target.value / 100;
    currentSong.volume = volume;
    updateVolumeUI(volume);  // Update icon and slider based on new volume
});

// Adding event listener to the volume button
document.querySelector('.volume').getElementsByTagName('img')[0].addEventListener('click', () => {
    const volumeImg = document.querySelector('.volume').getElementsByTagName('img')[0];
    
    if (volumeImg.src.includes('img/mute.svg')) {
        currentSong.volume = 0.4;
        updateVolumeUI(0.4);  // Update icon and slider for medium volume
    } else if (volumeImg.src.includes('img/volume.svg') || volumeImg.src.includes('img/loud.svg')) {
        currentSong.volume = 0;
        updateVolumeUI(0);  // Update icon and slider for mute
    }
})




main()