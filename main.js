//-----------------------------------------------------------------------------------------------//
// Handle DMD updates
let dmd = null;
let udmd = null;
let hiscores = {};
let info = null;
let shownInfo = null;
let loopCount = 0;
let fso = createAutomationObject("Scripting.FileSystemObject");
let updater;
let manufacturers = {
	"Aliens vs Pinball": ["./Scripts/dmds/manufacturers/Aliens vs Pinball.gif"],
	"Alvin G.": ["./Scripts/dmds/manufacturers/Alvin G..gif"],
	"Bally": ["./Scripts/dmds/manufacturers/bally.gif"],
	"Bethesda Pinball": ["./Scripts/dmds/manufacturers/Bethesda Pinball.gif"],
	"Capcom": ["./Scripts/dmds/manufacturers/capcom.gif"],
	"Data East": ["./Scripts/dmds/manufacturers/dataeast-1.gif", "./Scripts/dmds/manufacturers/dataeast-2.gif"],
	"Foxnext Games": ["./Scripts/dmds/manufacturers/Foxnext Games.gif"],
	"Gottlieb": ["./Scripts/dmds/manufacturers/gottlieb.gif"],
	"Jurassic Pinball": ["./Scripts/dmds/manufacturers/Jurassic Pinball.gif"],
	"Marvel": ["./Scripts/dmds/manufacturers/Marvel.gif"],
	"Midway": ["./Scripts/dmds/manufacturers/bally.gif"],
	"Peyper": ["./Scripts/dmds/manufacturers/peyper.gif"],	
	"Premier": ["./Scripts/dmds/manufacturers/premier.gif"],
	"Rowamet": ["./Scripts/dmds/manufacturers/Rowamet.gif"],	
	"Sega": ["./Scripts/dmds/manufacturers/sega.gif"],
	"Spooky": ["./Scripts/dmds/manufacturers/Spooky.gif"],
	"Star Wars Pinball": ["./Scripts/dmds/manufacturers/Star Wars Pinball.gif"],
	"Stern": ["./Scripts/dmds/manufacturers/stern.gif"],
	"Taito": ["./Scripts/dmds/manufacturers/Taito.gif"],
	"The Walking Dead": ["./Scripts/dmds/manufacturers/The Walking Dead.gif"],
	"Universal Pinball": ["./Scripts/dmds/manufacturers/Universal Pinball.gif"],
	"Williams": ["./Scripts/dmds/manufacturers/williams.gif"],
	"WilliamsFX3Pinball": ["./Scripts/dmds/manufacturers/williams.gif"],
	"VPX": ["./Scripts/dmds/manufacturers/VPX.gif"],
	"VALVe": ["./Scripts/dmds/manufacturers/VALVe.gif"],
	"Zaccaria": ["./Scripts/dmds/manufacturers/Zaccaria.gif"],
	"Zen Studios": ["./Scripts/dmds/manufacturers/Zen Studios.gif"]
}
// logfile.log(getMethods(dmd).join("\n"));
function TestMarshalling() {
	dmd.LockRenderThread();
	let video = dmd.NewVideo("Manufacturer", "./Scripts/dmds/manufacturers/bally.gif");
	logfile.log(getMethods(video).join("\n"));
	// This will fail due to a marshalling problem
	dmd.Stage.AddActor(video);
	dmd.UnlockRenderThread();
}
function UpdateDMD() {
	if (updater !== undefined) clearTimeout(updater);
	updater = undefined;

	if (dmd == null) {
		dmd = createAutomationObject("FlexDMD.FlexDMD");
		dmd.GameName = "PinballY";
		dmd.RenderMode = 2; // 0 = Gray 4 shades, 1 = Gray 16 shades, 2 = Full color
//		dmd.Size = false;
		dmd.Width = 128; // normal:128 - high-res: 896
		dmd.Height = 32; // normal:32 - high-res: 224
		dmd.Show = true;
		dmd.Run = true;
		udmd = dmd.NewUltraDMD();
	}
	
	if (dmd.Run == false) return;

	if (info == null) return;

	if (udmd.IsRendering() && shownInfo != null && info.id == shownInfo.id) {
		// Add a timeout later for when the render queue will be finished
		updater = setTimeout(UpdateDMD, 1000);
		return;
	}
	
	dmd.LockRenderThread();

	if (shownInfo == null || info.id != shownInfo.id) {
		loopCount = 0;
		shownInfo = info;
	} else {
		loopCount++;
	}			

	udmd.CancelRendering();

	if (loopCount == 0) {
		/*let rom = info.resolveROM();
		logfile.log("> Update DMD for:");
		logfile.log("> rom: '".concat(rom.vpmRom, "'"));
		logfile.log("> manufacturer:", info.manufacturer);
		logfile.log("> title:", info.title);
		logfile.log("> year:", info.year);
		logfile.log("> Table type: ", info.tableType);
		logfile.log("> Highscore style: ", info.highScoreStyle);
		if (rom.vpmRom == null) {
			dmd.GameName = "";
		} else {
			dmd.GameName = rom.vpmRom.toString();
		}*/
	}

	
	// Title
	var hasTitle = false;
	if (info.mediaName != null) {
		var extensions = [".gif", ".avi", ".png"];
		for (var i = 0; i < extensions.length; i++) {
			if (fso.FileExists("./Scripts/dmds/titles/" + info.mediaName + extensions[i])) {
				queueVideo("./Scripts/dmds/titles/" + info.mediaName + extensions[i], 0, 8, transitionMargin);
				hasTitle = true;
				break;
			}
		}
	}
	if (!hasTitle) {
		var name = info.title.trim();
		var subname = "";
		if (name.indexOf('(') != -1) {
			var sep = info.title.indexOf('(');
			name = info.title.slice(0, sep - 1).trim();
		}
		if (name.length >= 16) {
			var split = 16;
			for (var i = 15; i > 0; i--) {
				if (name.charCodeAt(i) == 32) {
					subname = name.slice(i).trim();
					name = name.slice(0, i).trim();
					break;
				}
			}
		}
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", name, 15, subname, 15, 0, 5000, 8);
	}

	// Manufacturer
	/*
	let transitionMargin = (20 * 1000) / 60;
	if (info.manufacturer in manufacturers) {
		var medias = manufacturers[info.manufacturer];
		var media = medias[Math.floor(Math.random() * medias.length)];
		queueVideo(media, 10, 8, transitionMargin);
	} else if (info.manufacturer !== undefined) {
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", info.manufacturer, 15, "", 15, 10, 3000, 8);
	}
	*/
	
	

// Manufacturer (incl. Workarround for Pinball FX3 Williams Logo)
    let transitionMargin = (20 * 1000) / 60;
    //kleine Workaround -Erweiterung für Williams "TM" Pinball Problem aus FX3
    let manufacturer_temp = info.manufacturer;
    
    // Wenn Manufacturer mit Williams anfängt, aber mehr als 8 Zeichen hat
    if ((manufacturer_temp.substr(0,8) == "Williams") && (manufacturer_temp.length > 8)){
        manufacturer_temp = "WilliamsFX3Pinball";
    }
    if (manufacturer_temp in manufacturers) {
        var medias = manufacturers[manufacturer_temp];
        var media = medias[Math.floor(Math.random() * medias.length)];
        queueVideo(media, 10, 8, transitionMargin);
    } else if (info.manufacturer !== undefined) {
        udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", info.manufacturer, 15, "", 15, 10, 3000, 8);
    }


	
	
	// Stats
	if (info.rating >= 0)
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", "Played " + info.playCount + " Rating " + info.rating, 15, "Play time: " + info.playTime.toHHMMSS(), 15, 10, 3000, 8);
	else
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", "Played " + info.playCount + " times", 15, "Playtime " + info.playTime.toHHMMSS(), 15, 10, 3000, 8);

	// Insert Coin
	if (((loopCount + 0) & 1) == 0) {
		udmd.DisplayScene00("./Scripts/dmds/misc/insert-coin_c.gif", "", 15, "", 15, 10, 3000, 8);
	}

	// Drink'n drive
	if (((loopCount + 0) & 1) == 0) {
		udmd.DisplayScene00("./Scripts/dmds/misc/drink-n-drive_c.gif", "", 15, "", 15, 10, 3000, 8);
	}

	// Global stats (every 4 loops)
	if (((loopCount + 1) & 3) == 0) {
		var totalCount = 0;
		var totalTime = 0;
		var nGames = gameList.getGameCount();
		for (var i = 0; i < nGames; i++) {
			var inf = gameList.getGame(i);
			totalCount += inf.playCount;
			totalTime += inf.playTime;
		}
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", "Total play count:" , 15, "" + totalCount, 15, 10, 1500, 8);
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", "Total play time:" , 15, "" + totalTime.toDDHHMMSS(), 15, 10, 1500, 8);
	}
	
	// Highscores
	if (hiscores[info.id] != null) {
		udmd.ScrollingCredits("", hiscores[info.id].join("|"), 15, 14, 2800 + hiscores[info.id].length * 400, 14);
	}

	// Digital Stereo
	if (((loopCount + 0) & 1) == 0) {
		udmd.DisplayScene00("./Scripts/dmds/misc/digital-stereo_c.gif", "", 15, "", 15, 10, 3000, 8);
	}
	
	dmd.UnlockRenderThread();
	logfile.log("< Update DMD done");

	// Add a timeout for when the queue will be finished
	updater = setTimeout(UpdateDMD, 10000);
}

gameList.on("gameselect", event => {
	logfile.log("> gameselect");
	info = event.game;
	UpdateDMD();
});

gameList.on("highscoresready", event => {
	logfile.log("> highscoresready");
	if (event.success && event.game != null) {
		logfile.log("> scores received");
		for (var i = 0; i < event.scores.length; i++) {
			event.scores[i] = event.scores[i].replace(/\u00FF/g, ',');
		}
		hiscores[event.game.id] = event.scores;
		if (shownInfo != null && event.game.id == shownInfo.id) {
			udmd.ScrollingCredits("", hiscores[shownInfo.id].join("|"), 15, 14, 2800 + hiscores[shownInfo.id].length * 400, 14);
		}
	}
});

mainWindow.on("prelaunch", event => {
	logfile.log("> launch");
	if (dmd != null) {
		udmd.CancelRendering();
		dmd.Run = false;
	}
});

mainWindow.on("postlaunch", event => {
	logfile.log("> postlaunch");
	if (dmd != null) dmd.Run = true;
	UpdateDMD();
});
