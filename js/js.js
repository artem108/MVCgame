var view = {

	showCount: function (count) {
		var elCount = document.getElementById("area_game__user_count--total");
		elCount.innerHTML = count;
	},

	showMsg: function (msg) {
		var elMessage = document.getElementById("area_game__user-message--msg");
		elMessage.innerHTML = msg;
	},

	showShip: function (id, color) {
		var elShip = document.getElementById(id);
		if (color == "red") {
			elShip.setAttribute("class", "ship-red");
		} else if (color == "blue") {
			elShip.setAttribute("class", "ship-blue");
		}
	},

	showAsteroid: function (id) {
		var elAsteroid = document.getElementById(id);
		elAsteroid.setAttribute("class", "asteroid");
	},

	soundShot: function () {
		var audio = document.getElementsByTagName("audio")[0];

		audio.pause();
		audio.currentTime = 0;
		setTimeout(function () {
   			audio.play();
		}, 20);
		// audio.play();
	}
};

/* ----------------------------- end view ------------------------------ */


/* ---------------------------- begin model ---------------------------- */

var model = {
	sizeSpace: 	  7,
	numShips: 	  6,
	lengthShips:  3,
	destroyShips: 0,

	spaceships: [
		{ position: ["0", "0", "0"], damage: ["", "", ""], color: "red"  },
		{ position: ["0", "0", "0"], damage: ["", "", ""], color: "blue" },
		{ position: ["0", "0", "0"], damage: ["", "", ""], color: "red"  },
		{ position: ["0", "0", "0"], damage: ["", "", ""], color: "blue" },
		{ position: ["0", "0", "0"], damage: ["", "", ""], color: "red"  },
		{ position: ["0", "0", "0"], damage: ["", "", ""], color: "blue" }
	],

	shot: function (id) {
		for (var i = 0; i < this.numShips; i++) {
			var spaceship = this.spaceships[i];
			var posDamage = spaceship.position.indexOf(id);
			// console.log(posDamage);
			if (posDamage >= 0) {

				if (spaceship.damage[posDamage] === "loss") {
					return true;
				}
				spaceship.damage[posDamage] = "loss";
				var color = spaceship.color;

				if (this.checkDestroyedShip(spaceship)) {
					this.destroyShips++;
					return {
						id: id,
						color: color,
						status: 3
					};
				}
				return {
					id: id,
					color: color,
					status: 1
				};
			}
		};
		return id;
	},

	checkDestroyedShip: function (ship) {
		for (var i = 0; i < this.lengthShips; i++) {
			if (ship.damage[i] === "") {
				return false;
			}
		};
		return true;
	},

	createShipPos: function () {
		var col = 0;
		var row = 0;
		var location = Math.floor(Math.random() * 2);
		var shipPosition = [];

		if (location === 1) { // horizontal
			row = Math.floor(Math.random() * this.sizeSpace);
			col = Math.floor(Math.random() * (this.sizeSpace - this.lengthShips + 1));
		} else { // vertical
			row = Math.floor(Math.random() * (this.sizeSpace - this.lengthShips + 1));
			col = Math.floor(Math.random() * this.sizeSpace);
		}

		for (var i = 0; i < this.lengthShips; i++) {
			if (location === 1) {
				shipPosition.push(row + "" + (col + i));
			} else {
				shipPosition.push((row + i) + "" + col);
			}
		};
		return shipPosition;
	},

	checkRepeatsPos: function (position) {
		for (var i = 0; i < this.numShips; i++) {
			var spaceship = this.spaceships[i];
			for (var j = 0; j < position.length; j++) {
				if (spaceship.position.indexOf(position[j]) >= 0) {
					return true;
				}
			};
		};
		return false;
	},

	createSpaceships: function () {
		var position;
		for (var i = 0; i < this.numShips; i++) {

			do {
				position = this.createShipPos();
			} while (this.checkRepeatsPos(position));
			this.spaceships[i].position = position;

		};
	}
};

/* ----------------------------- end model ----------------------------- */


/* -------------------------- begin controller ------------------------- */

var controller = {

	numShots: 0,

	createShips: function () {
		model.createSpaceships();
	},

	shotShip: function (c) {
		var id = this.convertToID(c);

		if (id) {
			var loss = model.shot(id);
			if (loss === true) {
				view.showMsg("Этот корабль уже подбит!");
			} else if (loss.status === 3) {
				view.showShip(loss.id, loss.color);
				view.showMsg("Флотилия из 3-х кораблей уничтожена!");
			} else if (loss.status === 1) {
				view.showShip(loss.id, loss.color);
				view.showMsg("Попадание");
			} else if (typeof(loss) == 'string') {
				view.showAsteroid(loss);
				view.showMsg("Промах");
			}
			this.numShots++;
			if (loss && (model.destroyShips === model.numShips)) {
				var count = Math.round((model.numShips * 3 / this.numShots) * 1000);
				view.showMsg("Вы уничтожили все корабли!");
				view.showCount(count);
			}
			view.soundShot();
		}
	},

	convertToID: function (c) {
		var symbol = ["A", "B", "C", "D", "E", "F", "G"];

		if (c !== null && c.length === 2) {

			var firstChar = c.charAt(0);
			var row = symbol.indexOf(firstChar);
			var col = c.charAt(1);

			if (!this.isNumeric(row) || !this.isNumeric(col)) {
				alert("Вы ввели не числовое значение!");
			} else if (row < 0 || row >= model.sizeSpace ||
					   col < 0 || col >= model.sizeSpace) {
				alert("Цель находиться за пределами карты!");
			} else {
				return row + col;
			}

		} else {
			alert("Пожалуйста введите символ A - G!");
		}
		return null;
	},

	isNumeric: function (n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},

	hoverClick: function (id) {
		var el = document.getElementById(id);
		el.onmouseover = function (e) {
			e = e || window.event;

			if (e.target.id !== "") {
				e.target.style.transition = "0.5s";
				e.target.style.backgroundColor = "rgba(104, 142, 218, 0.33)";

				e.target.onclick = function () {
					var c = this.getAttribute("data-title");
					controller.shotShip(c)
				};
			}
		};

		el.onmouseout = function (e) {
			e = e || window.event;
			if (e.target.id !== "") {
				e.target.style.backgroundColor = "inherit";
			}
		};
	},

	createDataTitle: function () {
		var elCell = document.getElementsByTagName("td");
		for (var i = 0; i < elCell.length; i++) {
			if (elCell[i].id !== "") {
				var value = elCell[i].getAttribute("id");
				var element = elCell[i];
				var letter = element.parentNode.firstElementChild.firstElementChild.innerHTML;

				elCell[i].setAttribute("data-title", letter + value.charAt(1));
			}
		};
	},

	hBtnClick: function () {
		var el = document.getElementById("crdInput");
		var elValueUp = el.value.toUpperCase();

		controller.shotShip(elValueUp);

		el.value = "";
	},

	hKeyPress: function (e) {
		e = e || window.event;

		var el = document.getElementById("btnShot");

		if (e.keyCode === 13) {
			el.click();
			return false;
		}
	}

};

/* --------------------------- end controller -------------------------- */




/* --------------------- anonymous initialize function ----------------- */
(function() {

	var start = {

		init: function () {
			this.main();
			this.control();
			this.event();
		},

		main: function () {

		},

		control: function () {

			controller.createShips();
			controller.createDataTitle();


		},

		event: function () {

			var btnShot = document.getElementById("btnShot");
			btnShot.onclick = controller.hBtnClick;

			var elCrdInput = document.getElementById("crdInput");
			elCrdInput.onkeypress = controller.hKeyPress;

			controller.hoverClick("area_game__table");

		}

	};
	start.init();

}());
