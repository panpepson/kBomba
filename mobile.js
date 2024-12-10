const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


var laser = new Howl({   src: [ 'http://gamecodeschool.com/wp-content/uploads/2016/07/asteroids-ship-shoot.wav']   });
var bum = new Howl({   src: [ 'https://www.stdimension.org/MediaLib/effects/technology/federation/hullbreak2.wav']  });
var bumB = new Howl({   src: [ 'https://dight310.byu.edu/media/audio/FreeLoops.com/3/3/Explosion%20Sounds.wav-21336-Free-Loops.com.mp3']   });
var kBomba = new Howl({   src: [ './Kapitan-Bomba-Gwiezdny-Patrol-Intro.mp3']   });
var gameOver = new Howl({   src: [ './Kbomba-game-over.mp3']   });
var wynik = new Howl({   src: [ './Kapitan-Bomba-wynik.mp3']   });

const scoreEl = document.querySelector('#scoreEl');
const recordEl = document.querySelector('#recordEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

let record = localStorage.getItem('kBomba-DB') || 0;
const kBombaScore = JSON.parse(localStorage.getItem('kBomba-DB')) || [];
  kBombaScore.forEach((scoredb ) => {
		      record =  scoredb.wynik;
				  })
recordEl.innerHTML=record;


// Klasa Player z aktualizacją pozycji dla dotyku
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update(touchX, touchY) {
        this.x = touchX;
        this.y = touchY;
        this.draw();
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}


class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1; // Przezroczystość dla efektu zanikania
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha; // Ustawienie przezroczystości
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01; // Stopniowe zanikanie
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

// Strzał na dotyk
canvas.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    const angle = Math.atan2(touchY - player.y, touchX - player.x);
    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4,
    };
    projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity));
	 laser.play();
});

// Aktualizacja pozycji gracza na podstawie ruchu dotyku
canvas.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    player.update(touchX, touchY);
});

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'white');
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;

function init() {
    player = new Player(x, y, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 3) + 4;
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        const velocity = { x: Math.cos(angle), y: Math.sin(angle) };
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}

function animate() {
    const animatedId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    projectiles.forEach((projectile, index) => {
        projectile.update();

        // Usunięcie pocisków poza ekranem
        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();
//-       
			const dist = Math.hypot(player.x - enemy.x,  player.y - enemy.y )
							if(dist - enemy.radius - player.radius < 1){
								cancelAnimationFrame(animatedId)
									modalEl.style.display = 'flex' ;
									bigScoreEl.innerHTML=score;
	
     return   new Promise((resolve, reject) =>{
										gameOver.play();
										resolve(); 
							}).then((response) =>{
	 										if(record < score){
								     		id = kBombaScore.length + 1;
  											scoredb  = {id: id, wynik:  score};
									 		kBombaScore.push(scoredb);
														localStorage.setItem("kBomba-DB", JSON.stringify(kBombaScore));  //zapisuje do Localstoreage
  											setTimeout(() => { wynik.play(); 
																recordEl.innerHTML= score;
										                   	}, 3000);
									           }
							      return response;
							})
//							gameOver.play(); 
//								 if(record < score){
//								     id = kBombaScore.length + 1;
//									 scoredb  = {id: id, wynik:  score};
//									 kBombaScore.push(scoredb);
//									localStorage.setItem("kBomba-DB", JSON.stringify(kBombaScore));
//										setTimeout(() => { wynik.play();  }, 3000);
//								  }
							}

	projectiles.forEach((projectile, projectileIndex) => {
    const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
    if (dist - enemy.radius - projectile.radius < 1) {
        for (let i = 0; i < enemy.radius * 2; i++) {
            particles.push(
                new Particle(
                    projectile.x,
                    projectile.y,
                    Math.random() * 2,
                    enemy.color,
                    {
                        x: (Math.random() - 0.5) * (Math.random() * 28),
                        y: (Math.random() - 0.5) * (Math.random() * 28),
                    }
                )
            );
        }

        if (enemy.radius - 10 > 5) {
            score += 100;
            scoreEl.innerHTML = score;
            gsap.to(enemy, {
                radius: enemy.radius - 10,
            });
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1);
            }, 0);
            bum.play();
        } else {
            score += 250;
            scoreEl.innerHTML = score;
            setTimeout(() => {
                enemies.splice(index, 1);
                projectiles.splice(projectileIndex, 1);
            }, 0);
            bumB.play();
        }
    }
});

    });
}

startGameBtn.addEventListener('click', () => {
    init();
    modalEl.style.display = 'none';
    spawnEnemies();
    animate();
  
});
kBomba.play();