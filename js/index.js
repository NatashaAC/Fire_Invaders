const canvas = document.getElementById('gameArea');
const ctx = canvas.getContext('2d');

// Setting the Width and Height of the canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player Class
class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }

        this.rotation = 0;

        const image = new Image();
        image.src = './img/fire_extinguisher.png';

        // Whenever the image finishes loading the properties will be set
        image.onload = () => {
            const scale = 0.20;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: canvas.width / 2 - this.width / 2, // Centering the player horizontally
                y: canvas.height - this.height - 10     // Centering the player vertically, 10px away from bottom edge of screen
            }
        }
    }

    // Drawing Player
    drawPlayer() {
        ctx.save();
        // Rotate Player
        ctx.translate(player.position.x + player.width / 2, player.position.y + player.height / 2);
        ctx.rotate(this.rotation);
        // Back to Center
        ctx.translate(-player.position.x - player.width / 2, -player.position.y - player.height / 2);

        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        ctx.restore(); 
    }

    updatePlayer() {
        if (this.image) {
            this.drawPlayer()
            this.position.x += this.velocity.x;
        }
    }
}

// Projectile Class
class Projectile {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;

        this.radius = 5;
    }

    drawProjectile() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }

    updateProjectile() {
        this.drawProjectile();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

// Fire Projectile Class
class FireProjectile {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;

        this.width = 3;
        this.height = 10;
    }

    drawFireProjectile() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    updateFireProjectile() {
        this.drawFireProjectile();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

// Enemy Class
class Fire {
    constructor({position}) {
        this.velocity = {
            x: 0, 
            y: 0
        }

        const image = new Image();
        image.src = './img/fire.png';

        // Whenever the image finishes loading the properties will be set
        image.onload = () => {
            const scale = 0.10;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: position.x, // Centering the enemy horizontally
                y: position.y   // Centering the player vertically
            }
        }
    }

    // Drawing Enemy
    drawFire() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height); 
    }

    updateFire({velocity}) {
        if (this.image) {
            this.drawFire();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }

    shoot(fireProjectiles) {
        fireProjectiles.push(new FireProjectile({
             position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                X: 0,
                y: 5
            }
        }))
    }
}

// Grid Class
class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        this.velocity = {
            x: 2,
            y: 0
        }
        this.flames = [];

        const columns = Math.floor(Math.random()* 8 + 5);
        const rows = Math.floor(Math.random()* 3 + 2);

        this.width = columns * 40

        // Spawing columns of multiple Flames on the horizontal axsis
        for (let x = 0; x < columns; x++) {
            // Spawing rows of multiple Flames on the vertical axsis
            for (let y = 0; y < rows; y++) {
                this.flames.push(new Fire({position: {
                    x: x * 40,
                    y: y * 50
                }}));
            }
        }
    }

    updateGrid() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.velocity.y = 0

        // Flames bouncing off sides of game area
        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 40
        }
    }
}

// Creating Player Instance
const player = new Player();

// Creating Projectiles Array
const projectiles = [];
const grids = [];
const fireProjectiles = [];

const keys = {
    arrowleft: {
        pressed: false
    },
    arrowright: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500)

function animate() {
    requestAnimationFrame(animate);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // console.log('player!');
    player.updatePlayer();

    fireProjectiles.forEach((fireProjectile, index) => {
        if (fireProjectile.position.y + fireProjectile.height >= canvas.height) {
            setTimeout(() => {
                fireProjectiles.splice(index, 1)
            }, 0)
        } else {
            fireProjectile.updateFireProjectile();
        }

        if(fireProjectile.position.y + fireProjectile.height >= player.position.y && fireProjectile.position.x + fireProjectile.width >= player.position.x && fireProjectile.position.x <= player.position.x + player.width) {
            console.log('you lose')
        }
    })
    console.log(fireProjectiles)

    // Creating Projectiles
    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        } else {
            projectile.updateProjectile();
        }
    })

    // Creating Grids
    grids.forEach((grid, gridIndex) => {
        grid.updateGrid()
        // Spawning Enemy Projectiles
        if(frames % 100 === 0 && grid.flames.length > 0) {
            grid.flames[Math.floor(Math.random() * grid.flames.length)].shoot(fireProjectiles);
        }
        grid.flames.forEach((flame, index) => {
            flame.updateFire({velocity: grid.velocity});

            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <= flame.position.y + flame.height && projectile.position.x + projectile.radius >= flame.position.x && projectile.position.x - projectile.radius <= flame.position.x + flame.width && projectile.position.y + projectile.radius >= flame.position.y) {

                    setTimeout(() => {
                        const flameFound = grid.flames.find(flame2 => {
                            return flame2 === flame;
                        })
                        const projectileFound = projectiles.find( projectile2 => {
                            return projectile2 === projectile;
                        })

                        // Remove flame and projectile
                        if(flameFound && projectileFound) {
                            grid.flames.splice(index, 1);
                            projectiles.splice(j, 1);

                            if(grid.flames.length > 0) {
                                const firstFlame = grid.flames[0];
                                const lastFlame = grid.flames[grid.flames.length - 1];

                                grid.width = lastFlame.position.x - firstFlame.position.x + lastFlame.width;
                                grid.position.x = firstFlame.position.x;
                            }
                        } else {
                            grids.splice(gridIndex, 1);
                        }
                    }, 0)
                }
            })
        });
    })

    // Monitoring Keys being pressed
    if(keys.arrowleft.pressed && player.position.x >= 0) {
        player.velocity.x = -5;
        player.rotation = -0.25;
    } else if (keys.arrowright.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 5;
        player.rotation = 0.25;
    } else {
        player.velocity.x = 0;
        player.rotation = 0;
    }

    // Spawning more flames after 1600 frames
    if (frames % randomInterval === 0) {
        grids.push(new Grid());
        randomInterval = Math.floor(Math.random() * 500 + 500)
        frames = 0
        // console.log(randomInterval)
    }
    frames++;
}

animate();

addEventListener('keydown', ({key}) => {
    // console.log('keydown');
    // console.log(key);
    switch (key) {
        case 'ArrowRight':
            // console.log('right');
            keys.arrowright.pressed = true;
            break;

        case 'ArrowLeft':
            // console.log('left');
            keys.arrowleft.pressed = true;
            break;
        
        case ' ':
            // console.log('fire');
            projectiles.push(new Projectile({
                    position: {
                        x: player.position.x + player.width / 2, // Centering projectile
                        y: player.position.y
                    }, 
                    velocity: {
                        x: 0, 
                        y: -10
                    }
                })
            );
            // console.log(projectiles);
            break;
    }
});

addEventListener('keyup', ({key}) => {
    // console.log('keydown');
    // console.log(key);
    switch (key) {
        case 'ArrowRight':
            // console.log('right');
            keys.arrowright.pressed = false;
            break;

        case 'ArrowLeft':
            // console.log('left');
            keys.arrowleft.pressed = false;
            break;
        
        case ' ':
            console.log('fire');
            break;
    }
});