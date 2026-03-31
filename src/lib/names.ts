export type FantasyNameDomain = "town" | "mountain" | "dragon" | "adventurer";

const mountainPrefixes = [
  "Ash",
  "Black",
  "Briar",
  "Cinder",
  "Cloud",
  "Cold",
  "Crow",
  "Dawn",
  "Dread",
  "Ember",
  "Frost",
  "Gloom",
  "Gold",
  "Gray",
  "High",
  "Iron",
  "Moon",
  "Raven",
  "Red",
  "Shadow",
  "Silver",
  "Sky",
  "Storm",
  "Stone",
  "Thorn",
  "Winter",
];

const mountainSuffixes = [
  "Barrow",
  "Cairn",
  "Crown",
  "Crag",
  "Fang",
  "Fastness",
  "Hall",
  "Heights",
  "Hold",
  "Peak",
  "Pillar",
  "Reach",
  "Rise",
  "Spine",
  "Summit",
  "Tor",
  "Watch",
];

const townPrefixes = [
  "Alder",
  "Bramble",
  "Copper",
  "Dun",
  "Elder",
  "Falcon",
  "Green",
  "Moss",
  "Oak",
  "Pine",
  "River",
  "Thistle",
];

const townSuffixes = [
  "Brook",
  "Cross",
  "Dale",
  "Ford",
  "Gate",
  "Hollow",
  "Keep",
  "Market",
  "Rest",
  "Vale",
  "Ward",
];

const dragonFirstSyllables = [
  "Astra",
  "Bal",
  "Cala",
  "Dra",
  "Ember",
  "Kael",
  "Mor",
  "Nyx",
  "Rhaz",
  "Saryx",
  "Thar",
  "Vora",
  "Zer",
];

const dragonLastSyllables = [
  "drath",
  "gor",
  "kar",
  "lith",
  "mora",
  "rax",
  "rys",
  "thys",
  "vyr",
  "zath",
];

const adventurerFirstNames = [
  "Alden",
  "Brinna",
  "Caelan",
  "Dorian",
  "Elira",
  "Fen",
  "Garrick",
  "Ilya",
  "Kestrel",
  "Lyra",
  "Marek",
  "Tarin",
];

const adventurerEpithets = [
  "Ashcloak",
  "Blackbriar",
  "Crowmantle",
  "Duskblade",
  "Emberhand",
  "Fenwalker",
  "Graypike",
  "Hollowmere",
  "Ironveil",
  "Stormward",
  "Thornwake",
  "Valeborn",
];

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function combineDistinct(prefixes: string[], suffixes: string[]) {
  let prefix = pickRandom(prefixes);
  let suffix = pickRandom(suffixes);

  while (prefix.toLowerCase() === suffix.toLowerCase()) {
    suffix = pickRandom(suffixes);
  }

  return `${prefix} ${suffix}`;
}

export function generateFantasyName(domain: FantasyNameDomain) {
  if (domain === "mountain") {
    return combineDistinct(mountainPrefixes, mountainSuffixes);
  }

  if (domain === "town") {
    return combineDistinct(townPrefixes, townSuffixes);
  }

  if (domain === "dragon") {
    return `${pickRandom(dragonFirstSyllables)}${pickRandom(dragonLastSyllables)}`;
  }

  return `${pickRandom(adventurerFirstNames)} ${pickRandom(adventurerEpithets)}`;
}
