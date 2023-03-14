/**
 *1. Render songs
 *2.Scroll top
 *3.Play/pause/seek
 *4. CD rotate
 *5. Next/prev
 *6. Random
 *7. Next/Repeat when ended
 *8.Active song
 *9. Scroll active song into view
 *10.Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player');
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomtBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [{
        name: "test",
        singer: "test",
        path: './music/song1.mp3',
        image: './img/1.jpg'
    }, {
        name: "Tu Phir Se Aana",
        singer: "Raftaar x Salim Merchant x Karma",
        path: './music/song2.mp3',
        image: './img/2.jpg'
    }, {
        name: "Naachne Ka Shaunq",
        singer: "Raftaar x Brobha V",
        path: './music/song3.mp3',
        image: './img/3.jpg'
    }, {
        name: "Mantoiyat",
        singer: "Raftaar x Nawazuddin Siddiqui",
        path: './music/song4.mp3',
        image: './img/4.jpg'
    }, {
        name: "Aage Chal",
        singer: "Raftaar",
        path: './music/song5.mp3',
        image: './img/5.jpg'
    }, {
        name: "Damn",
        singer: "Raftaar x kr$na",
        path: './music/song6.mp3',
        image: './img/6.jpg'
    }],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return ` <div class="song  ${index === this.currentIndex ? 'active' : ''}"  data-index="${index}">
            <div class="thumb" 
                style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>   `
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        const _this = this
        const cdWith = cd.offsetWidth

        //xu ly quay/dung CD
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], { duration: 10000, iterations: Infinity })

        cdThumbAnimate.pause()

        //xu ly phong to/thu nho CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWith = cdWith - scrollTop

            cd.style.width = newCdWith > 0 ? newCdWith + 'px' : 0
            cd.style.opacity = newCdWith / cdWith
        }

        //xu ly khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi song được player
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song bi pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // xử lý khi tua song
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        //khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.srollToActiveSong()
        }

        //khi prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.srollToActiveSong()
        }

        //khi random song
        randomtBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomtBtn.classList.toggle('active', _this.isRandom)
        }

        //xu ly phat lai song 
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //xu ly next/prepeat song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click()
            }
        }

        //LANG NGHE HANH VI CLICK vao play list
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            const optionNode = e.target.closest('.option')
            if (songNode || optionNode) {
                //xu ly khi click vao song 
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                //xu ly khi click vao song option 
                if (optionNode) {}
            }
        }
    },

    srollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 300)
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++
            if (this.currentIndex >= this.songs.length) {
                this.currentIndex = 0
            }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
            if (this.currentIndex < 0) {
                this.currentIndex = this.songs.length - 1
            }
        this.loadCurrentSong()
    },

    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function() {
        this.loadConfig() //gan cau hinh tu config vao ung dung

        this.defineProperties() //dinh nghia cac thuoc tinh cho thuoc tinh

        this.handleEvents() //lang nghe/xu ly cac su kien (DOM EVENT)

        this.loadCurrentSong() //tai thong tin bai hat dau tien vao UI khi chay ung dung

        this.render() // render playlist

        randomtBtn.classList.toggle('active', this.isRandom) //Hien thi trang thai ban dau cua btn random/repeate
        randomtBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()