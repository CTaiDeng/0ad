RMS.LoadLibrary("rmgen");
RMS.LoadLibrary("rmbiome");

setSelectedBiome();

const tMainTerrain = g_Terrains.mainTerrain;
const tForestFloor1 = g_Terrains.forestFloor1;
const tForestFloor2 = g_Terrains.forestFloor2;
const tCliff = g_Terrains.cliff;
const tTier1Terrain = g_Terrains.tier1Terrain;
const tTier2Terrain = g_Terrains.tier2Terrain;
const tTier3Terrain = g_Terrains.tier3Terrain;
const tRoad = g_Terrains.road;
const tRoadWild = g_Terrains.roadWild;
const tTier4Terrain = g_Terrains.tier4Terrain;
const tShore = g_Terrains.shore;
const tWater = g_Terrains.water;

var tHill = g_Terrains.hill;
var tDirt = g_Terrains.dirt;
if (currentBiome() == "temperate")
{
	tDirt = ["medit_shrubs_a", "grass_field"];
	tHill = ["grass_field", "peat_temp"];
}

const oTree1 = g_Gaia.tree1;
const oTree2 = g_Gaia.tree2;
const oTree3 = g_Gaia.tree3;
const oTree4 = g_Gaia.tree4;
const oTree5 = g_Gaia.tree5;
const oFruitBush = g_Gaia.fruitBush;
const oMainHuntableAnimal = g_Gaia.mainHuntableAnimal;
const oFish = g_Gaia.fish;
const oSecondaryHuntableAnimal = g_Gaia.secondaryHuntableAnimal;
const oStoneLarge = g_Gaia.stoneLarge;
const oMetalLarge = g_Gaia.metalLarge;

const aGrass = g_Decoratives.grass;
const aGrassShort = g_Decoratives.grassShort;
const aRockLarge = g_Decoratives.rockLarge;
const aRockMedium = g_Decoratives.rockMedium;
const aBushMedium = g_Decoratives.bushMedium;
const aBushSmall = g_Decoratives.bushSmall;

const pForest1 = [tForestFloor2 + TERRAIN_SEPARATOR + oTree1, tForestFloor2 + TERRAIN_SEPARATOR + oTree2, tForestFloor2];
const pForest2 = [tForestFloor1 + TERRAIN_SEPARATOR + oTree4, tForestFloor1 + TERRAIN_SEPARATOR + oTree5, tForestFloor1];

InitMap();

const radius = scaleByMapSize(15, 25);
const clPlayer = createTileClass();
const clHill = createTileClass();
const clMountain = createTileClass();
const clForest = createTileClass();
const clWater = createTileClass();
const clDirt = createTileClass();
const clRock = createTileClass();
const clMetal = createTileClass();
const clFood = createTileClass();
const clBaseResource = createTileClass();

const numPlayers = getNumPlayers();
const mapSize = getMapSize();
const centerOfMap = mapSize / 2;

const landHeight = 2;
const waterHeight = getMapBaseHeight();
const shoreRadius = 6;

initTerrain(tWater);

log("Creating the water...");
createArea(
	new ClumpPlacer(getMapArea(), 1, 1, 1, Math.round(fractionToTiles(0.5)), Math.round(fractionToTiles(0.5))),
	[
		new LayeredPainter([tWater, tWater, tShore], [1, 4]),
		new SmoothElevationPainter(ELEVATION_SET, waterHeight, 2),
		paintClass(clWater)
	],
	avoidClasses(clPlayer, 5));

var [playerIDs, playerX, playerZ] = radialPlayerPlacement(0.38);

log("Creating player islands...")
for (let i = 0; i < numPlayers; ++i)
{
	let id = playerIDs[i];
	log("Creating base for player " + id + "...");

	// Get the x and z in tiles
	let fx = fractionToTiles(playerX[i]);
	let fz = fractionToTiles(playerZ[i]);
	let ix = round(fx);
	let iz = round(fz);

	let hillSize = PI * radius * radius * 2;

	createArea(
		new ClumpPlacer(
			hillSize,
			0.8,
			0.1,
			10,
			Math.round(fractionToTiles(playerX[i])),
			Math.round(fractionToTiles(playerZ[i]))),
		[
			new LayeredPainter([tShore, tMainTerrain], [shoreRadius]),
			new SmoothElevationPainter(ELEVATION_SET, landHeight, shoreRadius),
			paintClass(clHill)
		],
		null);

	addCivicCenterAreaToClass(ix, iz, clPlayer);

	placeCivDefaultEntities(fx, fz, id, { "iberWall": false });

	// Create the city patch
	let cityRadius = radius/3;
	let placer = new ClumpPlacer(PI * cityRadius * cityRadius, 0.6, 0.3, 10, ix, iz);
	let painter = new LayeredPainter([tRoadWild, tRoad], [1]);
	createArea(placer, painter, null);

	placeDefaultChicken(fx, fz, clBaseResource);

	// Create berry bushes
	let bbAngle = randFloat(0, TWO_PI);
	let bbDist = 12;
	let bbX = round(fx + bbDist * cos(bbAngle));
	let bbZ = round(fz + bbDist * sin(bbAngle));
	let group = new SimpleGroup(
		[new SimpleObject(oFruitBush, 5, 5, 0, 3)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);

	// Create metal mine
	let mAngle = bbAngle;
	while (abs(mAngle - bbAngle) < PI/3)
		mAngle = randFloat(0, TWO_PI);

	let mDist = 12;
	let mX = round(fx + mDist * cos(mAngle));
	let mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oMetalLarge, 1, 1, 0, 0)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	// Create stone mines
	mAngle += randFloat(PI/8, PI/4);
	mX = round(fx + mDist * cos(mAngle));
	mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oStoneLarge, 1, 1, 0, 2)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	// Create starting trees, should avoid mines and bushes
	let tries = 50;
	let tDist = 16;
	let num = 50;
	for (let x = 0; x < tries; ++x)
	{
		let tAngle = randFloat(0, TWO_PI);
		let tX = round(fx + tDist * cos(tAngle));
		let tZ = round(fz + tDist * sin(tAngle));
		group = new SimpleGroup(
			[new SimpleObject(oTree2, num, num, 0, 7)],
			true, clBaseResource, tX, tZ
		);
		if (createObjectGroup(group, 0, avoidClasses(clBaseResource, 5)))
			break;
	}

	placeDefaultDecoratives(fx, fz, aGrassShort, clBaseResource, radius);
}

RMS.SetProgress(40);

log("Creating central island...");
createArea(
	new ChainPlacer(
		6,
		Math.floor(scaleByMapSize(10, 15)),
		Math.floor(scaleByMapSize(200, 300)),
		1,
		centerOfMap,
		centerOfMap,
		0,
		[Math.floor(mapSize * 0.01)]),
	[
		new LayeredPainter([tShore, tMainTerrain], [shoreRadius, 100]),
		new SmoothElevationPainter(ELEVATION_SET, landHeight, shoreRadius),
		paintClass(clHill)
	],
	avoidClasses(clPlayer, 40));

for (let m = 0; m < randIntInclusive(20, 34); ++m)
{
	let elevRand = randIntInclusive(6, 20);
	createArea(
		new ChainPlacer(
			7,
			15,
			Math.floor(scaleByMapSize(15, 20)),
			1,
			randIntExclusive(0, mapSize),
			randIntExclusive(0, mapSize),
			0,
			[Math.floor(mapSize * 0.01)]),
		[
			new LayeredPainter([tDirt, tHill], [Math.floor(elevRand / 3), 40]),
			new SmoothElevationPainter(ELEVATION_SET, elevRand, Math.floor(elevRand / 3)),
			paintClass(clHill)
		],
		[avoidClasses(clBaseResource, 2, clPlayer, 40), stayClasses(clHill, 6)]);
}

for (let m = 0; m < randIntInclusive(8, 17); ++m)
{
	let elevRand = randIntInclusive(15, 29);
	createArea(
		new ChainPlacer(
				5,
				8,
				Math.floor(scaleByMapSize(15, 20)),
				1,
				randIntExclusive(0, mapSize),
				randIntExclusive(0, mapSize),
				0,
				[Math.floor(mapSize * 0.01)]),
		[
			new LayeredPainter([tCliff, tForestFloor2], [Math.floor(elevRand / 3), 40]),
			new SmoothElevationPainter(ELEVATION_MODIFY, elevRand, Math.floor(elevRand / 3)),
			paintClass(clMountain)
		],
		[avoidClasses(clBaseResource, 2, clPlayer, 40), stayClasses(clHill, 6)]);
}

log("Creating center bounty...");
createObjectGroup(
	new SimpleGroup(
		[new SimpleObject(oMetalLarge, 3, 6, 25, Math.floor(mapSize * 0.25))],
		true,
		clBaseResource,
		centerOfMap,
		centerOfMap),
	0,
	[avoidClasses(clBaseResource, 20, clPlayer, 40, clMountain, 4), stayClasses(clHill, 10)]);

createObjectGroup(
	new SimpleGroup(
		[new SimpleObject(oStoneLarge, 3, 6, 25, Math.floor(mapSize * 0.25))],
		true,
		clBaseResource,
		centerOfMap,
		centerOfMap),
		0,
		[avoidClasses(clBaseResource, 20, clPlayer, 40, clMountain, 4), stayClasses(clHill, 10)]);

createObjectGroup(
	new SimpleGroup(
		[new SimpleObject(oMainHuntableAnimal, Math.floor(6 * numPlayers), Math.floor(6 * numPlayers), 2, Math.floor(mapSize * 0.1))],
		true,
		clBaseResource,
		centerOfMap,
		centerOfMap),
	0,
	[avoidClasses(clBaseResource, 2, clMountain, 4, clPlayer, 40, clWater, 2), stayClasses(clHill, 10)]);

log("Creating fish...");
createObjectGroupsDeprecated(
	new SimpleGroup([new SimpleObject(oFish, 2, 3, 0, 2)], true, clFood),
	0,
	avoidClasses(clHill, 10, clFood, 20),
	10 * numPlayers,
	60);

var [forestTrees, stragglerTrees] = getTreeCounts(...rBiomeTreeCount(0.7));
createForests(
	[tMainTerrain, tForestFloor1, tForestFloor2, pForest1, pForest2],
	[avoidClasses(clPlayer, 25, clForest, 10, clBaseResource, 3, clMetal, 6, clRock, 3, clMountain, 2), stayClasses(clHill, 6)],
	clForest,
	forestTrees);

let types = [oTree1, oTree2, oTree4, oTree3];
createStragglerTrees(
	types,
	[avoidClasses(clBaseResource, 2, clMetal, 6, clRock, 3, clMountain, 2, clPlayer, 25), stayClasses(clHill, 6)],
	clForest,
	stragglerTrees);
RMS.SetProgress(65);

log("Creating dirt patches...");
var numb = currentBiome() == "savanna" ? 3 : 1;
for (let size of [scaleByMapSize(3, 6), scaleByMapSize(5, 10), scaleByMapSize(8, 21)])
	createAreas(
		new ChainPlacer(1, Math.floor(scaleByMapSize(3, 5)), size, 0.5),
		[
			new LayeredPainter([[tMainTerrain, tTier1Terrain], [tTier1Terrain, tTier2Terrain], [tTier2Terrain, tTier3Terrain]], [1, 1]),
			paintClass(clDirt)
		],
		avoidClasses(clForest, 0, clMountain, 0, clDirt, 5, clPlayer, 10),
		numb * scaleByMapSize(15, 45));

log("Painting shorelines...");
paintTerrainBasedOnHeight(1, landHeight, 0, tMainTerrain);
paintTerrainBasedOnHeight(waterHeight, 1, 3, tTier1Terrain);

log("Creating grass patches...");
for (let size of [scaleByMapSize(2, 4), scaleByMapSize(3, 7), scaleByMapSize(5, 15)])
	createAreas(
		new ChainPlacer(1, Math.floor(scaleByMapSize(3, 5)), size, 0.5),
		new TerrainPainter(tTier4Terrain),
		avoidClasses(clForest, 0, clMountain, 0, clDirt, 5, clPlayer, 10),
		numb * scaleByMapSize(15, 45));

log("Creating food...");
createFood(
	[
		[new SimpleObject(oMainHuntableAnimal, 5, 7, 0, 4)],
		[new SimpleObject(oSecondaryHuntableAnimal, 2, 3, 0, 2)]
	],
	[3 * numPlayers, 3 * numPlayers],
	[avoidClasses(clForest, 0, clPlayer, 20, clMountain, 1, clFood, 4, clRock, 6, clMetal, 6), stayClasses(clHill, 2)],
	clFood);

RMS.SetProgress(75);

createFood(
	[
		[new SimpleObject(oFruitBush, 5, 7, 0, 4)]
	],
	[3 * numPlayers],
	[avoidClasses(clForest, 0, clPlayer, 15, clMountain, 1, clFood, 4, clRock, 6, clMetal, 6), stayClasses(clHill, 2)],
	clFood);

RMS.SetProgress(85);

createStragglerTrees(
	types,
	avoidClasses(clWater, 5, clForest, 7, clMountain, 1, clPlayer, 30, clMetal, 6, clRock, 3),
	clForest,
	stragglerTrees);

log("Creating decoration...");
var planetm = currentBiome() == "tropic" ? 8 : 1;
createDecoration(
	[
		[new SimpleObject(aRockMedium, 1, 3, 0, 1)],
		[new SimpleObject(aRockLarge, 1, 2, 0, 1), new SimpleObject(aRockMedium, 1, 3, 0, 2)],
		[new SimpleObject(aGrassShort, 2, 15, 0, 1, -PI/8, PI/8)],
		[new SimpleObject(aGrass, 2, 10, 0, 1.8, -PI/8, PI/8), new SimpleObject(aGrassShort, 3, 10, 1.2, 2.5, -PI/8, PI/8)],
		[new SimpleObject(aBushMedium, 1, 5, 0, 2), new SimpleObject(aBushSmall, 2, 4, 0, 2)]
	],
	[
		scaleByMapSize(16, 262),
		scaleByMapSize(8, 131),
		planetm * scaleByMapSize(13, 200),
		planetm * scaleByMapSize(13, 200),
		planetm * scaleByMapSize(13, 200)
	],
	avoidClasses(clForest, 2, clPlayer, 20, clMountain, 5, clFood, 1, clBaseResource, 2));

log("Creating water forests...");
var [forestTrees, stragglerTrees] = getTreeCounts(...rBiomeTreeCount(0.1));
createForests(
	[tMainTerrain, tForestFloor1, tForestFloor2, pForest1, pForest2],
	avoidClasses(clPlayer, 30, clHill, 10, clFood, 5),
	clForest,
	forestTrees);

log("Creating small grass tufts...");
createObjectGroupsDeprecated(
	new SimpleGroup([new SimpleObject(aGrassShort, 1, 2, 0, 1)]),
	0,
	[avoidClasses(clMountain, 2, clPlayer, 2, clDirt, 0), stayClasses(clHill, 8)],
	planetm * scaleByMapSize(13, 200));

setSkySet(pickRandom(["cloudless", "cumulus", "overcast"]));
setWaterMurkiness(0.4);

ExportMap();
