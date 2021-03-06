RMS.LoadLibrary("rmgen");

const tGrass = ["temp_grass_aut", "temp_grass_aut", "temp_grass_d_aut"];
const tForestFloor = "temp_grass_aut";
const tGrassA = "temp_grass_plants_aut";
const tGrassB = "temp_grass_b_aut";
const tGrassC = "temp_grass_c_aut";
const tHill = ["temp_highlands_aut", "temp_grass_long_b_aut"];
const tCliff = ["temp_cliff_a", "temp_cliff_b"];
const tRoad = "temp_road_aut";
const tGrassPatch = "temp_grass_plants_aut";
const tShore = "temp_plants_bog_aut";
const tWater = "temp_mud_a";

const oBeech = "gaia/flora_tree_euro_beech_aut";
const oOak = "gaia/flora_tree_oak_aut";
const oPine = "gaia/flora_tree_pine";
const oDeer = "gaia/fauna_deer";
const oFish = "gaia/fauna_fish";
const oSheep = "gaia/fauna_rabbit";
const oBerryBush = "gaia/flora_bush_berry";
const oStoneLarge = "gaia/geology_stonemine_temperate_quarry";
const oStoneSmall = "gaia/geology_stone_temperate";
const oMetalLarge = "gaia/geology_metal_temperate_slabs";
const oWood = "gaia/special_treasure_wood";
const oFood = "gaia/special_treasure_food_bin";
const oMetal = "gaia/special_treasure_metal";
const oStone = "gaia/special_treasure_stone";

const aGrass = "actor|props/flora/grass_soft_dry_small_tall.xml";
const aGrassShort = "actor|props/flora/grass_soft_dry_large.xml";
const aRockLarge = "actor|geology/stone_granite_med.xml";
const aRockMedium = "actor|geology/stone_granite_med.xml";
const aReeds = "actor|props/flora/reeds_pond_dry.xml";
const aLillies = "actor|props/flora/water_lillies.xml";
const aBushMedium = "actor|props/flora/bush_medit_me_dry.xml";
const aBushSmall = "actor|props/flora/bush_medit_sm_dry.xml";

const pForestD = [tForestFloor + TERRAIN_SEPARATOR + oBeech, tForestFloor];
const pForestO = [tForestFloor + TERRAIN_SEPARATOR + oOak, tForestFloor];
const pForestP = [tForestFloor + TERRAIN_SEPARATOR + oPine, tForestFloor];

InitMap();

const numPlayers = getNumPlayers();
const mapSize = getMapSize();

var clPlayer = createTileClass();
var clHill = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();

var [playerIDs, playerX, playerZ] = radialPlayerPlacement();

for (var i=0; i < numPlayers; i++)
{
	log("Creating base for player " + playerIDs[i] + "...");
	playerX[i] *= mapSize;
	playerZ[i] *= mapSize;

	for (let dist of [6, 8])
	{
		let ents = getStartingEntities(i);

		if (dist == 8)
			ents = ents.filter(ent => ent.Template.indexOf("female") != -1 || ent.Template.indexOf("infantry") != -1);

		placeStartingEntities(playerX[i], playerZ[i], i + 1, ents, dist);
	}

	// Create treasure
	var bbAngle = BUILDING_ORIENTATION;
	var bbDist = 10;
	var bbX = round(playerX[i] + bbDist * cos(bbAngle));
	var bbZ = round(playerZ[i] + bbDist * sin(bbAngle));
	var group = new SimpleGroup(
		[new SimpleObject(oFood, 5,5, 0,2)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);

	bbAngle += PI/2;
	var bbX = round(playerX[i] + bbDist * cos(bbAngle));
	var bbZ = round(playerZ[i] + bbDist * sin(bbAngle));
	group = new SimpleGroup(
		[new SimpleObject(oWood, 5,5, 0,2)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);

	bbAngle += PI/2;
	var bbX = round(playerX[i] + bbDist * cos(bbAngle));
	var bbZ = round(playerZ[i] + bbDist * sin(bbAngle));
	group = new SimpleGroup(
		[new SimpleObject(oMetal, 3,3, 0,2)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);

	bbAngle += PI/2;
	var bbX = round(playerX[i] + bbDist * cos(bbAngle));
	var bbZ = round(playerZ[i] + bbDist * sin(bbAngle));
	group = new SimpleGroup(
		[new SimpleObject(oStone, 2,2, 0,2)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);

	// Base texture
	var civ = getCivCode(i);
	var tilesSize = civ == "cart" ? 27 : 22;

	const minBoundX = (playerX[i] > tilesSize ? playerX[i] - tilesSize : 0);
	const minBoundY = (playerZ[i] > tilesSize ? playerZ[i] - tilesSize : 0);
	const maxBoundX = (playerX[i] < mapSize - tilesSize ? playerX[i] + tilesSize : mapSize);
	const maxBoundY = (playerZ[i] < mapSize - tilesSize ? playerZ[i] + tilesSize : mapSize);

	for (var tx = minBoundX; tx < maxBoundX; ++tx)
		for (var ty = minBoundY; ty < maxBoundY; ++ty)
		{
			var unboundSumOfXY = tx + ty - minBoundX - minBoundY;
			if ((unboundSumOfXY > tilesSize) && (unboundSumOfXY < 3 * tilesSize) && (tx - ty + minBoundY - minBoundX < tilesSize) && (ty - tx - minBoundY + minBoundX < tilesSize))
			{
				placeTerrain(floor(tx), floor(ty), tRoad);
				addToClass(floor(tx), floor(ty), clPlayer);
			}
		}

	// Place custom fortress
	if (civ == "brit" || civ == "gaul" || civ == "iber")
	{
		var wall = ["gate", "tower", "wallLong",
			"cornerIn", "wallLong", "barracks", "tower", "wallLong", "tower", "house", "wallLong",
			"cornerIn", "wallLong", "house", "tower", "gate", "tower", "house", "wallLong",
			"cornerIn", "wallLong", "house", "tower", "wallLong", "tower", "house", "wallLong",
			"cornerIn", "wallLong", "house", "tower"];
	}
	else
	{
		var wall = ["gate", "tower", "wallLong",
			"cornerIn", "wallLong", "barracks", "tower", "wallLong", "tower", "wallLong",
			"cornerIn", "wallLong", "house", "tower", "gate", "tower", "wallLong",
			"cornerIn", "wallLong", "house", "tower", "wallLong", "tower", "wallLong",
			"cornerIn", "wallLong", "house", "tower"];
	}
	placeCustomFortress(playerX[i], playerZ[i], new Fortress("Spahbod", wall), civ, i+1);
}

log("Creating lakes...");
var numLakes = round(scaleByMapSize(1,4) * numPlayers);
var waterAreas = createAreas(
	new ClumpPlacer(scaleByMapSize(100,250), 0.8, 0.1, 10),
	[
		new LayeredPainter([tShore, tWater, tWater], [1, 1]),
		new SmoothElevationPainter(ELEVATION_SET, -4, 3),
		paintClass(clWater)
	],
	avoidClasses(clPlayer, 7, clWater, 20),
	numLakes);

RMS.SetProgress(15);

log("Creating reeds...");
createObjectGroupsByAreasDeprecated(
	new SimpleGroup([new SimpleObject(aReeds, 5,10, 0,4), new SimpleObject(aLillies, 0,1, 0,4)], true),
	0,
	[borderClasses(clWater, 3, 0), stayClasses(clWater, 1)],
	numLakes, 100,
	waterAreas);

RMS.SetProgress(25);

log("Creating fish...");
createObjectGroupsByAreasDeprecated(
	new SimpleGroup(
		[new SimpleObject(oFish, 1,1, 0,1)],
		true, clFood
	),
	0,
	[stayClasses(clWater, 4),  avoidClasses(clFood, 8)],
	numLakes / 4,
	50,
	waterAreas);
RMS.SetProgress(30);

createBumps(avoidClasses(clWater, 2, clPlayer, 5));
RMS.SetProgress(35);

log("Creating hills...");
createHills([tCliff, tCliff, tHill], avoidClasses(clPlayer, 5, clWater, 5, clHill, 15), clHill, scaleByMapSize(1, 4) * numPlayers);
RMS.SetProgress(40);

log("Creating forests...");
var [forestTrees, stragglerTrees] = getTreeCounts(500, 2500, 0.7);
var types = [
	[[tForestFloor, tGrass, pForestD], [tForestFloor, pForestD]],
	[[tForestFloor, tGrass, pForestO], [tForestFloor, pForestO]],
	[[tForestFloor, tGrass, pForestP], [tForestFloor, pForestP]]
];
var size = forestTrees / (scaleByMapSize(3,6) * numPlayers);
var num = floor(size / types.length);
for (let type of types)
	createAreas(
		new ChainPlacer(1, Math.floor(scaleByMapSize(3, 5)), forestTrees / num, 0.5),
		[
			new LayeredPainter(type, [2]),
			paintClass(clForest)
		],
		avoidClasses(clPlayer, 5, clWater, 3, clForest, 15, clHill, 1),
		num);
RMS.SetProgress(50);

log("Creating dirt patches...");
createLayeredPatches(
 [scaleByMapSize(3, 6), scaleByMapSize(5, 10), scaleByMapSize(8, 21)],
 [[tGrass,tGrassA],[tGrassA,tGrassB], [tGrassB,tGrassC]],
 [1,1],
 avoidClasses(clWater, 1, clForest, 0, clHill, 0, clDirt, 5, clPlayer, 1),
 scaleByMapSize(15, 45),
 clDirt);
RMS.SetProgress(55);

log("Creating grass patches...");
createPatches(
 [scaleByMapSize(2, 4), scaleByMapSize(3, 7), scaleByMapSize(5, 15)],
 tGrassPatch,
 avoidClasses(clWater, 1, clForest, 0, clHill, 0, clDirt, 5, clPlayer, 1),
 scaleByMapSize(15, 45),
 clDirt);
RMS.SetProgress(60);

log("Creating stone mines...");
createMines(
 [
  [new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)],
  [new SimpleObject(oStoneSmall, 2,5, 1,3)]
 ],
 avoidClasses(clWater, 0, clForest, 1, clPlayer, 5, clRock, 10, clHill, 1),
 clRock);
RMS.SetProgress(65);

log("Creating metal mines...");
createMines(
 [
  [new SimpleObject(oMetalLarge, 1,1, 0,4)]
 ],
 avoidClasses(clWater, 0, clForest, 1, clPlayer, 5, clMetal, 10, clRock, 5, clHill, 1),
 clMetal
);
RMS.SetProgress(70);

createDecoration
(
 [[new SimpleObject(aRockMedium, 1,3, 0,1)],
  [new SimpleObject(aRockLarge, 1,2, 0,1), new SimpleObject(aRockMedium, 1,3, 0,2)],
  [new SimpleObject(aGrassShort, 1,2, 0,1, -PI/8,PI/8)],
  [new SimpleObject(aGrass, 2,4, 0,1.8, -PI/8,PI/8), new SimpleObject(aGrassShort, 3,6, 1.2,2.5, -PI/8,PI/8)],
  [new SimpleObject(aBushMedium, 1,2, 0,2), new SimpleObject(aBushSmall, 2,4, 0,2)]
 ],
 [
  scaleByMapSize(16, 262),
  scaleByMapSize(8, 131),
  scaleByMapSize(13, 200),
  scaleByMapSize(13, 200),
  scaleByMapSize(13, 200)
 ],
 avoidClasses(clWater, 0, clForest, 0, clPlayer, 1, clHill, 0)
);
RMS.SetProgress(80);

createFood
(
 [
  [new SimpleObject(oSheep, 2,3, 0,2)],
  [new SimpleObject(oDeer, 5,7, 0,4)]
 ],
 [
  3 * numPlayers,
  3 * numPlayers
 ],
 avoidClasses(clWater, 0, clForest, 0, clPlayer, 6, clHill, 1, clFood, 20)
);
RMS.SetProgress(85);

createFood
(
 [
  [new SimpleObject(oBerryBush, 5,7, 0,4)]
 ],
 [
  randIntInclusive(1, 4) * numPlayers + 2
 ],
 avoidClasses(clWater, 2, clForest, 0, clPlayer, 6, clHill, 1, clFood, 10)
);

RMS.SetProgress(90);

createStragglerTrees(
	[oOak, oBeech, oPine],
	avoidClasses(clWater, 1, clForest, 1, clHill, 1, clPlayer, 1, clMetal, 6, clRock, 6),
	clForest,
	stragglerTrees);
RMS.SetProgress(95);

setSkySet("sunny");
setWaterColor(0.157, 0.149, 0.443);
setWaterTint(0.443,0.42,0.824);
setWaterWaviness(2.0);
setWaterType("lake");
setWaterMurkiness(0.83);

setFogFactor(0.35);
setFogThickness(0.22);
setFogColor(0.82,0.82, 0.73);
setPPSaturation(0.56);
setPPContrast(0.56);
setPPBloom(0.38);
setPPEffect("hdr");

ExportMap();
