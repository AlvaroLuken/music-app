export type Song = {
  id: string;
  title: string;
  artist: string;
  key: string;
  capo?: number;
  bpm: number;
  tags: string[];
  summary: string;
  sections: { name: string; chart: string }[];
};

// MVP catalog policy: only include public-domain/traditional material, original demo charts,
// or practice forms. Do not paste scraped/commercial song charts here without licensed rights.
export const songs: Song[] = [
  {
    id: "house-of-the-rising-sun",
    title: "House of the Rising Sun",
    artist: "Traditional",
    key: "Am",
    bpm: 78,
    tags: ["folk", "beginner", "public domain"],
    summary: "Public-domain folk standard with a clean six-chord progression.",
    sections: [
      { name: "Verse", chart: "[Am]There is a [C]house in [D]New Or[F]leans\n[Am]They call the [C]Rising [E]Sun\n[Am]It has been the [C]ruin of [D]many a poor [F]player\n[Am]And me, oh [E]I am [Am]one" },
      { name: "Turnaround", chart: "[Am] [C] [D] [F]\n[Am] [E] [Am] [E]" },
    ],
  },
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    artist: "John Newton",
    key: "G",
    bpm: 86,
    tags: ["hymn", "public domain", "3/4"],
    summary: "Sparse 3/4 arrangement for campfire guitar or bass roots.",
    sections: [
      { name: "Verse", chart: "[G]Amazing [G7]grace, how [C]sweet the [G]sound\nThat saved a soul like [D]me\nI [G]once was [G7]lost, but [C]now am [G]found\nWas blind, but [D]now I [G]see" },
    ],
  },
  {
    id: "will-the-circle-be-unbroken",
    title: "Will the Circle Be Unbroken",
    artist: "Traditional",
    key: "G",
    bpm: 104,
    tags: ["gospel", "public domain", "three chords"],
    summary: "Classic gospel/bluegrass progression with easy I-IV-V changes.",
    sections: [
      { name: "Chorus", chart: "Will the [G]circle be unbroken\nBy and [C]by, Lord, by and [G]by\nThere's a better home awaiting\nIn the [D]sky, Lord, in the [G]sky" },
      { name: "Progression", chart: "[G] [G] [C] [G]\n[G] [G] [D] [G]" },
    ],
  },
  {
    id: "this-train",
    title: "This Train",
    artist: "Traditional",
    key: "E",
    bpm: 112,
    tags: ["gospel", "blues", "public domain"],
    summary: "Driving two-chord gospel-blues form for strumming practice.",
    sections: [
      { name: "Verse", chart: "[E]This train is bound for glory, this train\nThis train is bound for [B7]glory, this [E]train\nThis train is bound for glory, don't carry nothing but the righteous and the holy\nThis train is bound for [B7]glory, this [E]train" },
    ],
  },
  {
    id: "hes-got-the-whole-world",
    title: "He's Got the Whole World",
    artist: "Traditional",
    key: "D",
    bpm: 92,
    tags: ["spiritual", "public domain", "beginner"],
    summary: "Simple spiritual with predictable changes and big singalong phrasing.",
    sections: [
      { name: "Verse", chart: "He's got the [D]whole world in His hands\nHe's got the [A7]whole world in His [D]hands\nHe's got the [D7]whole world in His [G]hands\nHe's got the [D]whole world [A7]in His [D]hands" },
    ],
  },
  {
    id: "down-by-the-riverside",
    title: "Down by the Riverside",
    artist: "Traditional",
    key: "G",
    bpm: 108,
    tags: ["spiritual", "public domain", "campfire"],
    summary: "Public-domain spiritual arranged with plain open-position chords.",
    sections: [
      { name: "Verse", chart: "I'm gonna [G]lay down my burden\nDown by the [D7]riverside\nDown by the [G]riverside\nDown by the [D7]riverside\nI'm gonna [G]lay down my burden\nDown by the [C]riverside\nAnd study war no [G]more [D7] [G]" },
    ],
  },
  {
    id: "swing-low-sweet-chariot",
    title: "Swing Low, Sweet Chariot",
    artist: "Traditional",
    key: "G",
    bpm: 72,
    tags: ["spiritual", "public domain", "slow"],
    summary: "Slow spiritual with generous spacing for chord-change practice.",
    sections: [
      { name: "Chorus", chart: "[G]Swing low, sweet [C]chari[G]ot\nComing for to carry me [D7]home\n[G]Swing low, sweet [C]chari[G]ot\nComing for to [D7]carry me [G]home" },
    ],
  },
  {
    id: "scarborough-fair",
    title: "Scarborough Fair",
    artist: "Traditional",
    key: "Em",
    bpm: 84,
    tags: ["folk", "modal", "public domain"],
    summary: "Minor/modal folk chart for arpeggio and fingerstyle practice.",
    sections: [
      { name: "Verse", chart: "[Em]Are you going to [D]Scarborough [Em]Fair\n[Em]Parsley, sage, rose[D]mary and [Em]thyme\n[Em]Remember me to [G]one who lives [D]there\n[Em]She once was a [D]true love of [Em]mine" },
    ],
  },
  {
    id: "shenandoah",
    title: "Shenandoah",
    artist: "Traditional",
    key: "D",
    bpm: 68,
    tags: ["folk", "public domain", "waltz"],
    summary: "Wide, slow folk melody with beginner-friendly harmonic movement.",
    sections: [
      { name: "Verse", chart: "Oh [D]Shenandoah, I long to [G]hear you\nAway, you rolling [D]river\nOh [D]Shenandoah, I long to [G]hear you\nAway, I'm bound [A7]away\nAcross the wide Mis[D]souri" },
    ],
  },
  {
    id: "michael-row-the-boat-ashore",
    title: "Michael Row the Boat Ashore",
    artist: "Traditional",
    key: "C",
    bpm: 84,
    tags: ["spiritual", "public domain", "beginner"],
    summary: "Traditional spiritual with simple I-IV-V harmony and clear phrase changes.",
    sections: [
      { name: "Chorus", chart: "[C]Michael row the boat ashore, halle[F]lu[C]jah\n[C]Michael row the boat ashore, [G7]halle[C]lujah" },
      { name: "Verse", chart: "[C]Sister help to trim the sail, halle[F]lu[C]jah\n[C]Sister help to trim the sail, [G7]halle[C]lujah" },
    ],
  },
  {
    id: "frankie-and-johnny",
    title: "Frankie and Johnny",
    artist: "Traditional",
    key: "C",
    bpm: 96,
    tags: ["blues", "traditional", "public domain"],
    summary: "Early folk-blues storytelling form with a simple dominant cadence.",
    sections: [
      { name: "Verse", chart: "[C]Frankie and Johnny were lovers\nOh Lordy, how they could [G7]love\nSwore to be true to each other\nTrue as the stars a[C]bove" },
    ],
  },
  {
    id: "careless-love",
    title: "Careless Love",
    artist: "Traditional",
    key: "C",
    bpm: 82,
    tags: ["blues", "folk", "public domain"],
    summary: "Public-domain blues ballad with clean I-IV-V movement.",
    sections: [
      { name: "Verse", chart: "[C]Love, oh love, oh careless love\n[F]Love, oh love, oh [C]careless love\n[C]Love, oh love, oh careless love\nYou see what [G7]careless love has [C]done" },
    ],
  },
  {
    id: "red-river-valley",
    title: "Red River Valley",
    artist: "Traditional",
    key: "D",
    bpm: 78,
    tags: ["country", "folk", "public domain"],
    summary: "Old cowboy waltz-style song with relaxed open-position changes.",
    sections: [
      { name: "Verse", chart: "From this [D]valley they say you are going\nWe will miss your bright eyes and sweet [A7]smile\nFor they [D]say you are taking the [G]sunshine\nThat has [D]brightened our [A7]pathway a [D]while" },
    ],
  },
  {
    id: "oh-susanna",
    title: "Oh! Susanna",
    artist: "Stephen Foster",
    key: "A",
    bpm: 118,
    tags: ["folk", "public domain", "beginner"],
    summary: "Fast public-domain folk song with straightforward tonic/dominant motion.",
    sections: [
      { name: "Chorus", chart: "[A]Oh! Susanna, oh don't you cry for [E7]me\nFor I [A]come from Alabama with my [E7]banjo on my [A]knee" },
    ],
  },
  {
    id: "camptown-races",
    title: "Camptown Races",
    artist: "Stephen Foster",
    key: "G",
    bpm: 126,
    tags: ["folk", "public domain", "fast"],
    summary: "Up-tempo two-chord public-domain tune for rhythm practice.",
    sections: [
      { name: "Chorus", chart: "[G]Gwine to run all night\nGwine to run all [D7]day\nI'll [G]bet my money on the bob-tail nag\nSome[D7]body bet on the [G]bay" },
    ],
  },
  {
    id: "when-the-saints",
    title: "When the Saints Go Marching In",
    artist: "Traditional",
    key: "C",
    bpm: 110,
    tags: ["jazz", "gospel", "public domain"],
    summary: "Essential public-domain standard with easy chords and a strong melody cue.",
    sections: [
      { name: "Verse", chart: "Oh when the [C]saints go marching in\nOh when the saints go marching [G7]in\nLord, I [C]want to be in that [F]number\nWhen the [C]saints go [G7]marching [C]in" },
    ],
  },
  {
    id: "midnight-room-demo",
    title: "Midnight Room",
    artist: "Original demo",
    key: "E",
    capo: 0,
    bpm: 104,
    tags: ["original", "rock", "bar chords"],
    summary: "Original seed song designed to demo transpose, simplify, and diagrams.",
    sections: [
      { name: "Verse", chart: "[E]Low light humming through the [B]wall\n[C#m7]Boots by the door and a [Aadd9]four-count fall\n[E]Nobody talks when the [B]amp gets loud\n[C#m7]We move like smoke through an [Aadd9]empty crowd" },
      { name: "Chorus", chart: "[A]Hold the line, [B]let it bloom\n[E]Every note finds the [C#m7]midnight room\n[A]No more noise, [B]no more proof\n[E]Just the string and the [B]truth" },
    ],
  },
  {
    id: "twelve-bar-a",
    title: "Twelve Bar in A",
    artist: "Practice form",
    key: "A",
    bpm: 96,
    tags: ["blues", "practice", "bass"],
    summary: "Clean I-IV-V practice chart for guitar comping and bass walking.",
    sections: [
      { name: "Form", chart: "[A7]One [A7]two [A7]three [A7]four\n[D7]One [D7]two [A7]three [A7]four\n[E7]One [D7]two [A7]three [E7]turn" },
    ],
  },
];

export function searchSongs(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return songs;
  return songs.filter((song) =>
    [song.title, song.artist, song.key, ...song.tags].some((value) => value.toLowerCase().includes(q)),
  );
}

export function getSong(id: string) {
  return songs.find((song) => song.id === id) ?? songs[0];
}
