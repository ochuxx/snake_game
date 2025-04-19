const mainCanvas = document.querySelector(".mainContainer__canvas")
const scoreView = document.querySelector(".mainContainer__points")
const bestView = document.querySelector(".mainContainer__best")
const context = mainCanvas.getContext("2d")
const fps = 1000 / 18
const tails = []
let score = 0
let bestScore = 0

//Detectando si existe la key en localstorage
if (localStorage.getItem("best")) {
    bestScore = localStorage.getItem("best")
} else {
    localStorage.setItem("best", bestScore)
    bestScore = localStorage.getItem("best")
}

class Snake {
    quitColor = true
    movementType = "right"
    isDead = false
    originalX = this.positionX
    originalY = this.positionY

    constructor(headColor, size, positionX, positionY) {
        this.headColor = headColor
        this.size = size
        this.positionX = positionX
        this.positionY = positionY
    }

    move() {
        let size = this.size

        switch (this.movementType) {
            case "right":
                this.positionX += size
                break
            case "left":
                this.positionX -= size
                break
            case "up":
                this.positionY -= size
                break
            case "down":
                this.positionY += size
                break
        }
        this.wallDetector()
        this.deadDetector()

        // Pintar serpiente en nueva posición
        context.fillStyle = this.headColor
        context.fillRect(this.positionX, this.positionY, size, size)

        // Quitar color pintado (anterior)
        if (this.quitColor) {
            context.clearRect(this.originalX, this.originalY, size, size)
        }

        if (this.isDead) {
            return true
        }

        this.originalX = this.positionX
        this.originalY = this.positionY

        setTimeout(() => {
            sendCoordinate()
            this.move()
        }, fps)
    }

    directionDetector(e) {
        const code = e.code
        switch (code) {
            // De esta forma se hace 'or' en switch-case
            case "ArrowUp":
            case "KeyW":
                if (this.movementType == "left" || this.movementType == "right") {
                    return this.movementType = "up"
                }
                break
            case "ArrowLeft":
            case "KeyA":
                if (this.movementType == "down" || this.movementType == "up") {
                    return this.movementType = "left"
                }
                break
            case "ArrowDown":
            case "KeyS":
                if (this.movementType == "left" || this.movementType == "right") {
                    return this.movementType = "down"
                }
                break
            case "ArrowRight":
            case "KeyD":
                if (this.movementType == "down" || this.movementType == "up") {
                    return this.movementType = "right"
                }
                break
        }
    }

    // Generar efecto de teletransportación cuando choca con pared
    wallDetector() {
        if (this.positionX < 0) {
            this.positionX = mainCanvas.width - this.size
        }
        if (this.positionX + this.size > mainCanvas.width) {
            this.positionX = 0
        }
        if (this.positionY < 0) {
            this.positionY = mainCanvas.height - this.size
        }
        if (this.positionY + this.size > mainCanvas.height) {
            this.positionY = 0
        }
    }

    deadDetector() {
        let tailPosition = []
        tails.forEach((element, i) => {
            if (i == 0) {
                return
            }

            tailPosition.push([element.getCurrentPosition()[0], element.getCurrentPosition()[1]])
        })

        tailPosition.forEach((element) => {
            if (this.positionX == element[0] && this.positionY == element[1]) {
                return this.isDead = true
            }
        })
    }

    tailCreator() {
        let last = tails.length - 1
        let x = 0
        let y = 0
        switch (this.movementType) {
            case "right":
                x = tails[last].getCurrentPosition()[0] - this.size
                y = tails[last].getCurrentPosition()[1]
                break
            case "left":
                x = tails[last].getCurrentPosition()[0] + this.size
                y = tails[last].getCurrentPosition()[1]
                break
            case "up":
                x = tails[last].getCurrentPosition()[0]
                y = tails[last].getCurrentPosition()[1] + this.size
                break
            case "down":
                x = tails[last].getCurrentPosition()[0]
                y = tails[last].getCurrentPosition()[1] - this.size
                break
        }
        tails.push(new Tail("white", this.size, x, y))
        return tails[tails.length - 1].move()
    }

    setQuitColor(bool) {
        return this.quitColor = bool
    }

    getCurrentPosition() {
        return [this.positionX, this.positionY]
    }

    getPreviusPosition() {
        return [this.originalX, this.originalY]
    }
}

class Tail extends Snake {
    originalX = this.positionX
    originalY = this.positionY

    move() {
        let size = this.size
        this.wallDetector()

        context.fillStyle = this.headColor
        context.fillRect(this.positionX, this.positionY, size, size)

        if (this.quitColor) {
            context.clearRect(this.originalX, this.originalY, size, size)
        }
    }

    setPosition(x, y) {
        this.originalX = this.positionX
        this.originalY = this.positionY
        this.positionX = x
        this.positionY = y
    }
}

class Apple {
    positionX = 0
    positionY = 0

    constructor(color, size) {
        this.color = color
        this.size = size
    }

    move() {
        this.findRandomPosition()

        context.fillStyle = this.color
        context.fillRect(this.positionX, this.positionY, this.size, this.size)
    }

    findRandomPosition() {
        const squaresQuantity = mainCanvas.height / this.size
        const position = []
        const tailPosition = []
        let again = false

        tails.forEach((element) => {
            tailPosition.push([element.getCurrentPosition()[0], element.getCurrentPosition()[1]])
        })

        for (let i = 0; i <= 1; i++) {
            let squareSelected = Math.floor(Math.random() * squaresQuantity)
            let square = squareSelected * this.size
            position.push(square)
        }

        tailPosition.forEach((element) => {
            if (element[0] == position[0] && element[1] == position[1]) {
                return again = true
            }
        })

        if (again) {
            return this.findRandomPosition()
        }

        this.positionX = position[0]
        this.positionY = position[1]
    }

    getCurrentPosition() {
        return [this.positionX, this.positionY]
    }
}

function sendCoordinate() {
    /*
    sendCoordinate() hace un bucle por el total de colas que tiene la serpiente, y estás detectan la posición de su anterior objeto para seguirlo y dar el efecto que se van moviendo
    */
    tails.forEach((element, i) => {
        if (i == 0) {
            return
        }

        element.setPosition(tails[i - 1].getPreviusPosition()[0], tails[i - 1].getPreviusPosition()[1])
        element.move()
    })
}

function comparator(snake, apple) {
    /*
    comparator() recibe la posición de la serpiente y la manzana,
    si coinciden sus ejes en X y en Y entonces coloca un punto con la función pointWon().
    Recibe como parametro el objeto de la serpiente (obj1) y el objeto de la manzana (obj2)
    */
    let detector = setInterval(() => {
        pos1 = snake.getCurrentPosition()
        pos2 = apple.getCurrentPosition()

        if (pos1[0] == pos2[0] && pos1[1] == pos2[1]) {
            clearInterval(detector)
            pointWon(snake, apple)
        }
    }, 1)
}

function pointWon(snake, apple) {
    /*
    pointWon() agrega una nueva manzana en un lugar aleatorio, pone un punto en el contador, 
    incrementa el tamaño de la serpiente y reinicia el comparator().
    Recibe como parametro el objeto de la serpiente (obj1) y el objeto de la manzana (obj2)
    */
    tails[tails.length - 1].setQuitColor(false)
    snake.tailCreator()
    apple.move()
    score++
    scoreView.innerHTML = score.toString()

    //Comparando si la puntuación actual supera a la mejor
    if (score >= bestScore) {
        localStorage.setItem("best", score)
        bestScore = localStorage.getItem("best")
        bestView.innerHTML = bestScore.toString()
    }
    comparator(snake, apple)
}

function main() {
    const snake = new Snake("#229954", 25, 200, 500)
    const apple = new Apple("red", 25)
    tails.push(snake)
    snake.move()
    apple.move()
    comparator(snake, apple)

    // Mejor puntuación en el tablero
    bestView.innerHTML = bestScore.toString()

    // Evento de dirección para mover snake
    window.addEventListener("keydown", (e) => {
        snake.directionDetector(e)
    })
}

main()