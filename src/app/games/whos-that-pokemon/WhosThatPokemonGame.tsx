"use client";

import { useEffect, useMemo, useState } from "react";
import "./whos-that-pokemon.css";

type Pokemon = {
  id: number;
  name: string;
};

type Question = {
  pokemon: Pokemon;
  answers: Pokemon[];
};

const POKEMON: Pokemon[] = [
  { id: 1, name: "Bulbasaur" },
  { id: 2, name: "Ivysaur" },
  { id: 3, name: "Venusaur" },
  { id: 4, name: "Charmander" },
  { id: 5, name: "Charmeleon" },
  { id: 6, name: "Charizard" },
  { id: 7, name: "Squirtle" },
  { id: 8, name: "Wartortle" },
  { id: 9, name: "Blastoise" },
  { id: 10, name: "Caterpie" },
  { id: 11, name: "Metapod" },
  { id: 12, name: "Butterfree" },
  { id: 13, name: "Weedle" },
  { id: 14, name: "Kakuna" },
  { id: 15, name: "Beedrill" },
  { id: 16, name: "Pidgey" },
  { id: 17, name: "Pidgeotto" },
  { id: 18, name: "Pidgeot" },
  { id: 19, name: "Rattata" },
  { id: 20, name: "Raticate" },
  { id: 21, name: "Spearow" },
  { id: 22, name: "Fearow" },
  { id: 23, name: "Ekans" },
  { id: 24, name: "Arbok" },
  { id: 25, name: "Pikachu" },
  { id: 26, name: "Raichu" },
  { id: 27, name: "Sandshrew" },
  { id: 28, name: "Sandslash" },
  { id: 29, name: "Nidoran♀" },
  { id: 30, name: "Nidorina" },
  { id: 31, name: "Nidoqueen" },
  { id: 32, name: "Nidoran♂" },
  { id: 33, name: "Nidorino" },
  { id: 34, name: "Nidoking" },
  { id: 35, name: "Clefairy" },
  { id: 36, name: "Clefable" },
  { id: 37, name: "Vulpix" },
  { id: 38, name: "Ninetales" },
  { id: 39, name: "Jigglypuff" },
  { id: 40, name: "Wigglytuff" },
  { id: 41, name: "Zubat" },
  { id: 42, name: "Golbat" },
  { id: 43, name: "Oddish" },
  { id: 44, name: "Gloom" },
  { id: 45, name: "Vileplume" },
  { id: 46, name: "Paras" },
  { id: 47, name: "Parasect" },
  { id: 48, name: "Venonat" },
  { id: 49, name: "Venomoth" },
  { id: 50, name: "Diglett" },
  { id: 51, name: "Dugtrio" },
  { id: 52, name: "Meowth" },
  { id: 53, name: "Persian" },
  { id: 54, name: "Psyduck" },
  { id: 55, name: "Golduck" },
  { id: 56, name: "Mankey" },
  { id: 57, name: "Primeape" },
  { id: 58, name: "Growlithe" },
  { id: 59, name: "Arcanine" },
  { id: 60, name: "Poliwag" },
  { id: 61, name: "Poliwhirl" },
  { id: 62, name: "Poliwrath" },
  { id: 63, name: "Abra" },
  { id: 64, name: "Kadabra" },
  { id: 65, name: "Alakazam" },
  { id: 66, name: "Machop" },
  { id: 67, name: "Machoke" },
  { id: 68, name: "Machamp" },
  { id: 69, name: "Bellsprout" },
  { id: 70, name: "Weepinbell" },
  { id: 71, name: "Victreebel" },
  { id: 72, name: "Tentacool" },
  { id: 73, name: "Tentacruel" },
  { id: 74, name: "Geodude" },
  { id: 75, name: "Graveler" },
  { id: 76, name: "Golem" },
  { id: 77, name: "Ponyta" },
  { id: 78, name: "Rapidash" },
  { id: 79, name: "Slowpoke" },
  { id: 80, name: "Slowbro" },
  { id: 81, name: "Magnemite" },
  { id: 82, name: "Magneton" },
  { id: 83, name: "Farfetch'd" },
  { id: 84, name: "Doduo" },
  { id: 85, name: "Dodrio" },
  { id: 86, name: "Seel" },
  { id: 87, name: "Dewgong" },
  { id: 88, name: "Grimer" },
  { id: 89, name: "Muk" },
  { id: 90, name: "Shellder" },
  { id: 91, name: "Cloyster" },
  { id: 92, name: "Gastly" },
  { id: 93, name: "Haunter" },
  { id: 94, name: "Gengar" },
  { id: 95, name: "Onix" },
  { id: 96, name: "Drowzee" },
  { id: 97, name: "Hypno" },
  { id: 98, name: "Krabby" },
  { id: 99, name: "Kingler" },
  { id: 100, name: "Voltorb" },
  { id: 101, name: "Electrode" },
  { id: 102, name: "Exeggcute" },
  { id: 103, name: "Exeggutor" },
  { id: 104, name: "Cubone" },
  { id: 105, name: "Marowak" },
  { id: 106, name: "Hitmonlee" },
  { id: 107, name: "Hitmonchan" },
  { id: 108, name: "Lickitung" },
  { id: 109, name: "Koffing" },
  { id: 110, name: "Weezing" },
  { id: 111, name: "Rhyhorn" },
  { id: 112, name: "Rhydon" },
  { id: 113, name: "Chansey" },
  { id: 114, name: "Tangela" },
  { id: 115, name: "Kangaskhan" },
  { id: 116, name: "Horsea" },
  { id: 117, name: "Seadra" },
  { id: 118, name: "Goldeen" },
  { id: 119, name: "Seaking" },
  { id: 120, name: "Staryu" },
  { id: 121, name: "Starmie" },
  { id: 122, name: "Mr. Mime" },
  { id: 123, name: "Scyther" },
  { id: 124, name: "Jynx" },
  { id: 125, name: "Electabuzz" },
  { id: 126, name: "Magmar" },
  { id: 127, name: "Pinsir" },
  { id: 128, name: "Tauros" },
  { id: 129, name: "Magikarp" },
  { id: 130, name: "Gyarados" },
  { id: 131, name: "Lapras" },
  { id: 132, name: "Ditto" },
  { id: 133, name: "Eevee" },
  { id: 134, name: "Vaporeon" },
  { id: 135, name: "Jolteon" },
  { id: 136, name: "Flareon" },
  { id: 137, name: "Porygon" },
  { id: 138, name: "Omanyte" },
  { id: 139, name: "Omastar" },
  { id: 140, name: "Kabuto" },
  { id: 141, name: "Kabutops" },
  { id: 142, name: "Aerodactyl" },
  { id: 143, name: "Snorlax" },
  { id: 144, name: "Articuno" },
  { id: 145, name: "Zapdos" },
  { id: 146, name: "Moltres" },
  { id: 147, name: "Dratini" },
  { id: 148, name: "Dragonair" },
  { id: 149, name: "Dragonite" },
  { id: 150, name: "Mewtwo" },
  { id: 151, name: "Mew" },
  { id: 152, name: "Chikorita" },
  { id: 155, name: "Cyndaquil" },
  { id: 158, name: "Totodile" },
  { id: 172, name: "Pichu" },
  { id: 175, name: "Togepi" },
  { id: 196, name: "Espeon" },
  { id: 197, name: "Umbreon" },
  { id: 212, name: "Scizor" },
  { id: 214, name: "Heracross" },
  { id: 216, name: "Teddiursa" },
  { id: 220, name: "Swinub" },
  { id: 225, name: "Delibird" },
  { id: 229, name: "Houndoom" },
  { id: 230, name: "Kingdra" },
  { id: 233, name: "Porygon2" },
  { id: 239, name: "Elekid" },
  { id: 246, name: "Larvitar" },
  { id: 249, name: "Lugia" },
  { id: 250, name: "Ho-Oh" },
  { id: 252, name: "Treecko" },
  { id: 255, name: "Torchic" },
  { id: 258, name: "Mudkip" },
  { id: 280, name: "Ralts" },
  { id: 282, name: "Gardevoir" },
  { id: 302, name: "Sableye" },
  { id: 303, name: "Mawile" },
  { id: 306, name: "Aggron" },
  { id: 320, name: "Wailmer" },
  { id: 330, name: "Flygon" },
  { id: 359, name: "Absol" },
  { id: 371, name: "Bagon" },
  { id: 373, name: "Salamence" },
  { id: 374, name: "Beldum" },
  { id: 376, name: "Metagross" },
  { id: 380, name: "Latias" },
  { id: 381, name: "Latios" },
  { id: 384, name: "Rayquaza" },
  { id: 390, name: "Chimchar" },
  { id: 393, name: "Piplup" },
  { id: 395, name: "Empoleon" },
  { id: 403, name: "Shinx" },
  { id: 404, name: "Luxio" },
  { id: 405, name: "Luxray" },
  { id: 447, name: "Riolu" },
  { id: 448, name: "Lucario" },
  { id: 461, name: "Weavile" },
  { id: 470, name: "Leafeon" },
  { id: 471, name: "Glaceon" },
  { id: 477, name: "Dusknoir" },
  { id: 478, name: "Froslass" },
  { id: 479, name: "Rotom" },
  { id: 483, name: "Dialga" },
  { id: 484, name: "Palkia" },
  { id: 487, name: "Giratina" },
  { id: 491, name: "Darkrai" },
  { id: 493, name: "Arceus" },
  { id: 495, name: "Snivy" },
  { id: 498, name: "Tepig" },
  { id: 501, name: "Oshawott" },
  { id: 511, name: "Pansage" },
  { id: 513, name: "Pansear" },
  { id: 515, name: "Panpour" },
  { id: 519, name: "Pidove" },
  { id: 522, name: "Blitzle" },
  { id: 524, name: "Roggenrola" },
  { id: 529, name: "Drilbur" },
  { id: 530, name: "Excadrill" },
  { id: 531, name: "Audino" },
  { id: 532, name: "Timburr" },
  { id: 535, name: "Tympole" },
  { id: 543, name: "Venipede" },
  { id: 550, name: "Basculin" },
  { id: 551, name: "Sandile" },
  { id: 554, name: "Darumaka" },
  { id: 559, name: "Scraggy" },
  { id: 570, name: "Zorua" },
  { id: 571, name: "Zoroark" },
  { id: 574, name: "Gothita" },
  { id: 577, name: "Solosis" },
  { id: 587, name: "Emolga" },
  { id: 592, name: "Frillish" },
  { id: 599, name: "Klink" },
  { id: 602, name: "Tynamo" },
  { id: 605, name: "Elgyem" },
  { id: 610, name: "Axew" },
  { id: 612, name: "Haxorus" },
  { id: 613, name: "Cubchoo" },
  { id: 619, name: "Mienfoo" },
  { id: 624, name: "Pawniard" },
  { id: 625, name: "Bisharp" },
  { id: 627, name: "Rufflet" },
  { id: 628, name: "Braviary" },
  { id: 633, name: "Deino" },
  { id: 635, name: "Hydreigon" },
  { id: 636, name: "Larvesta" },
  { id: 637, name: "Volcarona" },
  { id: 638, name: "Cobalion" },
  { id: 639, name: "Terrakion" },
  { id: 640, name: "Virizion" },
  { id: 641, name: "Tornadus" },
  { id: 642, name: "Thundurus" },
  { id: 643, name: "Reshiram" },
  { id: 644, name: "Zekrom" },
  { id: 645, name: "Landorus" },
  { id: 646, name: "Kyurem" },
  { id: 647, name: "Keldeo" },
  { id: 648, name: "Meloetta" },
  { id: 649, name: "Genesect" },
  { id: 650, name: "Chespin" },
  { id: 653, name: "Fennekin" },
  { id: 656, name: "Froakie" },
  { id: 658, name: "Greninja" },
  { id: 661, name: "Fletchling" },
  { id: 662, name: "Fletchinder" },
  { id: 663, name: "Talonflame" },
  { id: 667, name: "Litleo" },
  { id: 668, name: "Pyroar" },
  { id: 674, name: "Pancham" },
  { id: 675, name: "Pangoro" },
  { id: 677, name: "Espurr" },
  { id: 678, name: "Meowstic" },
  { id: 679, name: "Honedge" },
  { id: 680, name: "Doublade" },
  { id: 681, name: "Aegislash" },
  { id: 682, name: "Spritzee" },
  { id: 684, name: "Swirlix" },
  { id: 685, name: "Slurpuff" },
  { id: 686, name: "Inkay" },
  { id: 687, name: "Malamar" },
  { id: 690, name: "Skrelp" },
  { id: 691, name: "Dragalge" },
  { id: 692, name: "Clauncher" },
  { id: 693, name: "Clawitzer" },
  { id: 696, name: "Tyrunt" },
  { id: 697, name: "Tyrantrum" },
  { id: 698, name: "Amaura" },
  { id: 699, name: "Aurorus" },
  { id: 700, name: "Sylveon" },
  { id: 701, name: "Hawlucha" },
  { id: 702, name: "Dedenne" },
  { id: 704, name: "Goomy" },
  { id: 705, name: "Sliggoo" },
  { id: 706, name: "Goodra" },
  { id: 708, name: "Phantump" },
  { id: 709, name: "Trevenant" },
  { id: 710, name: "Pumpkaboo" },
  { id: 711, name: "Gourgeist" },
  { id: 712, name: "Bergmite" },
  { id: 713, name: "Avalugg" },
  { id: 714, name: "Noibat" },
  { id: 715, name: "Noivern" },
  { id: 716, name: "Xerneas" },
  { id: 717, name: "Yveltal" },
  { id: 718, name: "Zygarde" },
  { id: 719, name: "Diancie" },
  { id: 720, name: "Hoopa" },
  { id: 721, name: "Volcanion" },
  { id: 722, name: "Rowlet" },
  { id: 725, name: "Litten" },
  { id: 728, name: "Popplio" },
  { id: 730, name: "Primarina" },
  { id: 731, name: "Pikipek" },
  { id: 734, name: "Yungoos" },
  { id: 736, name: "Grubbin" },
  { id: 737, name: "Charjabug" },
  { id: 738, name: "Vikavolt" },
  { id: 739, name: "Crabrawler" },
  { id: 741, name: "Oricorio" },
  { id: 744, name: "Rockruff" },
  { id: 745, name: "Lycanroc" },
  { id: 746, name: "Wishiwashi" },
  { id: 747, name: "Mareanie" },
  { id: 748, name: "Toxapex" },
  { id: 749, name: "Mudbray" },
  { id: 750, name: "Mudsdale" },
  { id: 751, name: "Dewpider" },
  { id: 752, name: "Araquanid" },
  { id: 753, name: "Fomantis" },
  { id: 754, name: "Lurantis" },
  { id: 755, name: "Morelull" },
  { id: 756, name: "Shiinotic" },
  { id: 757, name: "Salandit" },
  { id: 758, name: "Salazzle" },
  { id: 759, name: "Stufful" },
  { id: 760, name: "Bewear" },
  { id: 761, name: "Bounsweet" },
  { id: 762, name: "Steenee" },
  { id: 763, name: "Tsareena" },
  { id: 764, name: "Comfey" },
  { id: 765, name: "Oranguru" },
  { id: 766, name: "Passimian" },
  { id: 767, name: "Wimpod" },
  { id: 768, name: "Golisopod" },
  { id: 769, name: "Sandygast" },
  { id: 770, name: "Palossand" },
  { id: 771, name: "Pyukumuku" },
  { id: 772, name: "Type: Null" },
  { id: 773, name: "Silvally" },
  { id: 774, name: "Minior" },
  { id: 775, name: "Komala" },
  { id: 776, name: "Turtonator" },
  { id: 777, name: "Togedemaru" },
  { id: 778, name: "Mimikyu" },
  { id: 779, name: "Bruxish" },
  { id: 780, name: "Drampa" },
  { id: 781, name: "Dhelmise" },
  { id: 782, name: "Jangmo-o" },
  { id: 783, name: "Hakamo-o" },
  { id: 784, name: "Kommo-o" },
  { id: 785, name: "Tapu Koko" },
  { id: 786, name: "Tapu Lele" },
  { id: 787, name: "Tapu Bulu" },
  { id: 788, name: "Tapu Fini" },
  { id: 789, name: "Cosmog" },
  { id: 792, name: "Lunala" },
  { id: 793, name: "Nihilego" },
  { id: 800, name: "Necrozma" },
  { id: 801, name: "Magearna" },
  { id: 802, name: "Marshadow" },
  { id: 807, name: "Zeraora" },
  { id: 808, name: "Meltan" },
  { id: 809, name: "Melmetal" },
  { id: 810, name: "Grookey" },
  { id: 813, name: "Scorbunny" },
  { id: 816, name: "Sobble" },
  { id: 818, name: "Inteleon" },
  { id: 819, name: "Skwovet" },
  { id: 820, name: "Greedent" },
  { id: 821, name: "Rookidee" },
  { id: 823, name: "Corviknight" },
  { id: 824, name: "Blipbug" },
  { id: 825, name: "Dottler" },
  { id: 826, name: "Orbeetle" },
  { id: 827, name: "Nickit" },
  { id: 828, name: "Thievul" },
  { id: 829, name: "Gossifleur" },
  { id: 830, name: "Eldegoss" },
  { id: 831, name: "Wooloo" },
  { id: 832, name: "Dubwool" },
  { id: 833, name: "Chewtle" },
  { id: 834, name: "Drednaw" },
  { id: 835, name: "Yamper" },
  { id: 836, name: "Boltund" },
  { id: 837, name: "Rolycoly" },
  { id: 839, name: "Coalossal" },
  { id: 840, name: "Applin" },
  { id: 841, name: "Flapple" },
  { id: 842, name: "Appletun" },
  { id: 843, name: "Silicobra" },
  { id: 844, name: "Sandaconda" },
  { id: 845, name: "Cramorant" },
  { id: 846, name: "Arrokuda" },
  { id: 847, name: "Barraskewda" },
  { id: 848, name: "Toxel" },
  { id: 849, name: "Toxtricity" },
  { id: 850, name: "Sizzlipede" },
  { id: 851, name: "Centiskorch" },
  { id: 852, name: "Clobbopus" },
  { id: 853, name: "Grapploct" },
  { id: 854, name: "Sinistea" },
  { id: 855, name: "Polteageist" },
  { id: 856, name: "Hatenna" },
  { id: 857, name: "Hattrem" },
  { id: 858, name: "Hatterene" },
  { id: 859, name: "Impidimp" },
  { id: 860, name: "Morgrem" },
  { id: 861, name: "Grimmsnarl" },
  { id: 862, name: "Obstagoon" },
  { id: 863, name: "Perrserker" },
  { id: 864, name: "Cursola" },
  { id: 865, name: "Sirfetch'd" },
  { id: 866, name: "Mr. Rime" },
  { id: 867, name: "Runerigus" },
  { id: 868, name: "Milcery" },
  { id: 869, name: "Alcremie" },
  { id: 870, name: "Falinks" },
  { id: 871, name: "Pincurchin" },
  { id: 872, name: "Snom" },
  { id: 873, name: "Frosmoth" },
  { id: 874, name: "Stonjourner" },
  { id: 875, name: "Eiscue" },
  { id: 876, name: "Indeedee" },
  { id: 877, name: "Morpeko" },
  { id: 878, name: "Cufant" },
  { id: 879, name: "Copperajah" },
  { id: 880, name: "Dracozolt" },
  { id: 881, name: "Arctozolt" },
  { id: 882, name: "Dracovish" },
  { id: 883, name: "Arctovish" },
  { id: 884, name: "Duraludon" },
  { id: 885, name: "Dreepy" },
  { id: 886, name: "Drakloak" },
  { id: 887, name: "Dragapult" },
  { id: 888, name: "Zacian" },
  { id: 889, name: "Zamazenta" },
  { id: 890, name: "Eternatus" },
  { id: 891, name: "Kubfu" },
  { id: 892, name: "Urshifu" },
  { id: 893, name: "Zarude" },
  { id: 894, name: "Regieleki" },
  { id: 895, name: "Regidrago" },
  { id: 896, name: "Glastrier" },
  { id: 897, name: "Spectrier" },
  { id: 898, name: "Calyrex" },
  { id: 899, name: "Wyrdeer" },
  { id: 900, name: "Kleavor" },
  { id: 901, name: "Ursaluna" },
  { id: 902, name: "Basculegion" },
  { id: 903, name: "Sneasler" },
  { id: 904, name: "Overqwil" },
  { id: 905, name: "Enamorus" },
  { id: 906, name: "Sprigatito" },
  { id: 909, name: "Fuecoco" },
  { id: 912, name: "Quaxly" },
  { id: 914, name: "Quaquaval" },
  { id: 915, name: "Lechonk" },
  { id: 916, name: "Oinkologne" },
  { id: 917, name: "Tarountula" },
  { id: 918, name: "Spidops" },
  { id: 919, name: "Nymble" },
  { id: 920, name: "Lokix" },
  { id: 921, name: "Pawmi" },
  { id: 923, name: "Pawmot" },
  { id: 924, name: "Tandemaus" },
  { id: 925, name: "Maushold" },
  { id: 926, name: "Fidough" },
  { id: 927, name: "Dachsbun" },
  { id: 928, name: "Smoliv" },
  { id: 930, name: "Arboliva" },
  { id: 931, name: "Squawkabilly" },
  { id: 932, name: "Nacli" },
  { id: 934, name: "Garganacl" },
  { id: 935, name: "Charcadet" },
  { id: 936, name: "Armarouge" },
  { id: 937, name: "Ceruledge" },
  { id: 938, name: "Tadbulb" },
  { id: 939, name: "Bellibolt" },
  { id: 940, name: "Wattrel" },
  { id: 941, name: "Kilowattrel" },
  { id: 942, name: "Maschiff" },
  { id: 943, name: "Mabosstiff" },
  { id: 944, name: "Shroodle" },
  { id: 945, name: "Grafaiai" },
  { id: 946, name: "Bramblin" },
  { id: 947, name: "Brambleghast" },
  { id: 948, name: "Toedscool" },
  { id: 949, name: "Toedscruel" },
  { id: 950, name: "Klawf" },
  { id: 951, name: "Capsakid" },
  { id: 952, name: "Scovillain" },
  { id: 953, name: "Rellor" },
  { id: 954, name: "Rabsca" },
  { id: 955, name: "Flittle" },
  { id: 956, name: "Espathra" },
  { id: 957, name: "Tinkatink" },
  { id: 959, name: "Tinkaton" },
  { id: 960, name: "Wiglett" },
  { id: 961, name: "Wugtrio" },
  { id: 962, name: "Bombirdier" },
  { id: 963, name: "Finizen" },
  { id: 964, name: "Palafin" },
  { id: 965, name: "Varoom" },
  { id: 966, name: "Revavroom" },
  { id: 967, name: "Cyclizar" },
  { id: 968, name: "Orthworm" },
  { id: 969, name: "Glimmet" },
  { id: 970, name: "Glimmora" },
  { id: 971, name: "Greavard" },
  { id: 972, name: "Houndstone" },
  { id: 973, name: "Flamigo" },
  { id: 974, name: "Cetoddle" },
  { id: 975, name: "Cetitan" },
  { id: 976, name: "Veluza" },
  { id: 977, name: "Dondozo" },
  { id: 978, name: "Tatsugiri" },
  { id: 979, name: "Annihilape" },
  { id: 980, name: "Clodsire" },
  { id: 981, name: "Farigiraf" },
  { id: 982, name: "Dudunsparce" },
  { id: 983, name: "Kingambit" },
  { id: 984, name: "Great Tusk" },
  { id: 985, name: "Scream Tail" },
  { id: 986, name: "Brute Bonnet" },
  { id: 987, name: "Flutter Mane" },
  { id: 988, name: "Slither Wing" },
  { id: 989, name: "Sandy Shocks" },
  { id: 990, name: "Iron Treads" },
  { id: 991, name: "Iron Bundle" },
  { id: 992, name: "Iron Hands" },
  { id: 993, name: "Iron Jugulis" },
  { id: 994, name: "Iron Moth" },
  { id: 995, name: "Iron Thorns" },
  { id: 996, name: "Frigibax" },
  { id: 998, name: "Baxcalibur" },
  { id: 999, name: "Gimmighoul" },
  { id: 1000, name: "Gholdengo" },
  { id: 1001, name: "Wo-Chien" },
  { id: 1002, name: "Chien-Pao" },
  { id: 1003, name: "Ting-Lu" },
  { id: 1004, name: "Chi-Yu" },
  { id: 1005, name: "Roaring Moon" },
  { id: 1006, name: "Iron Valiant" },
  { id: 1007, name: "Koraidon" },
  { id: 1008, name: "Miraidon" },
  { id: 1009, name: "Walking Wake" },
  { id: 1010, name: "Iron Leaves" },
  { id: 1011, name: "Dipplin" },
  { id: 1012, name: "Poltchageist" },
  { id: 1013, name: "Sinistcha" },
  { id: 1014, name: "Okidogi" },
  { id: 1015, name: "Munkidori" },
  { id: 1016, name: "Fezandipiti" },
  { id: 1017, name: "Ogerpon" },
  { id: 1018, name: "Archaludon" },
  { id: 1019, name: "Hydrapple" },
  { id: 1020, name: "Gouging Fire" },
  { id: 1021, name: "Raging Bolt" },
  { id: 1022, name: "Iron Boulder" },
  { id: 1023, name: "Iron Crown" },
  { id: 1024, name: "Terapagos" },
  { id: 1025, name: "Pecharunt" },
];

const TOTAL_ROUNDS = 10;
const ROUND_TIME = 15;

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function makeQuestion(usedIds: number[]): Question {
  const available = POKEMON.filter((pokemon) => !usedIds.includes(pokemon.id));

  const pokemon =
    available[Math.floor(Math.random() * available.length)] ??
    POKEMON[Math.floor(Math.random() * POKEMON.length)];

  const distractors = shuffle(
    POKEMON.filter((item) => item.id !== pokemon.id),
  ).slice(0, 3);

  return {
    pokemon,
    answers: shuffle([pokemon, ...distractors]),
  };
}

function imageUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export default function WhosThatPokemonGame() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem("pokeprices-whos-that-pokemon-high-score");

    if (stored) {
      const parsed = Number(stored);

      if (Number.isFinite(parsed)) {
        setHighScore(parsed);
      }
    }
  }, []);

  const progress = useMemo(
    () => ((round - 1) / TOTAL_ROUNDS) * 100,
    [round],
  );

  function startGame() {
    const firstQuestion = makeQuestion([]);

    setQuestion(firstQuestion);
    setUsedIds([firstQuestion.pokemon.id]);
    setRound(1);
    setTimeLeft(ROUND_TIME);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelected(null);
    setAnswered(false);
    setGameOver(false);
    setStarted(true);
  }

  function finishGame(finalScore: number) {
    setGameOver(true);
    setStarted(false);

    if (finalScore > highScore) {
      setHighScore(finalScore);
      window.localStorage.setItem(
        "pokeprices-whos-that-pokemon-high-score",
        String(finalScore),
      );
    }
  }

  function nextQuestion() {
    if (round >= TOTAL_ROUNDS) {
      finishGame(score);
      return;
    }

    const nextRound = round + 1;
    const nextQuestionData = makeQuestion(usedIds);

    setRound(nextRound);
    setQuestion(nextQuestionData);
    setUsedIds([...usedIds, nextQuestionData.pokemon.id]);
    setSelected(null);
    setAnswered(false);
    setTimeLeft(ROUND_TIME);
  }

  function answerPokemon(answer: Pokemon) {
    if (!question || answered || gameOver) {
      return;
    }

    setSelected(answer);
    setAnswered(true);

    const correct = answer.id === question.pokemon.id;

    if (correct) {
      const timeBonus = timeLeft * 10;
      const streakBonus = streak * 25;
      const points = 100 + timeBonus + streakBonus;

      const newStreak = streak + 1;

      setScore((current) => current + points);
      setStreak(newStreak);
      setBestStreak((current) => Math.max(current, newStreak));
    } else {
      setStreak(0);
    }

    window.setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        const finalCorrect =
          correct ? 100 + timeLeft * 10 + streak * 25 : 0;

        finishGame(score + finalCorrect);
      } else {
        nextQuestion();
      }
    }, 1100);
  }

  useEffect(() => {
    if (!started || !question || answered || gameOver) {
      return;
    }

    if (timeLeft <= 0) {
      setAnswered(true);
      setSelected(null);
      setStreak(0);

      window.setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          finishGame(score);
        } else {
          nextQuestion();
        }
      }, 900);

      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [
    started,
    question,
    answered,
    gameOver,
    timeLeft,
    round,
    score,
    usedIds,
  ]);

  if (!started && !gameOver) {
    return (
      <main className="whos-page">
        <div className="whos-wrap">
          <header className="whos-head">
            <div className="game-kicker">POKE PRICES • MINI GAME</div>
            <h1>Who&apos;s That Pokémon?</h1>
            <p>
              Can you identify the Pokémon from its silhouette? You&apos;ve got
              15 seconds and four possible answers.
            </p>
          </header>

          <section className="intro-card">
            <div className="intro-silhouette">
              <img
                src={imageUrl(25)}
                alt=""
                draggable={false}
              />
            </div>

            <div className="intro-content">
              <span className="intro-label">10 ROUNDS</span>

              <h2>Test your Pokémon knowledge</h2>

              <p>
                Every round shows a different Pokémon hidden in silhouette.
                Pick the correct answer before the timer runs out.
              </p>

              <div className="rules">
                <div>
                  <strong>100+</strong>
                  <span>base points</span>
                </div>

                <div>
                  <strong>15s</strong>
                  <span>per Pokémon</span>
                </div>

                <div>
                  <strong>🔥</strong>
                  <span>streak bonus</span>
                </div>
              </div>

              <button className="start-button" onClick={startGame}>
                Start Game
              </button>

              <div className="high-score">
                High score <strong>{highScore.toLocaleString()}</strong>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (gameOver) {
    return (
      <main className="whos-page">
        <div className="whos-wrap">
          <header className="whos-head">
            <div className="game-kicker">GAME COMPLETE</div>
            <h1>Who&apos;s That Pokémon?</h1>
            <p>You made it through all {TOTAL_ROUNDS} rounds.</p>
          </header>

          <section className="results-card">
            <div className="results-trophy">🏆</div>

            <span className="results-label">FINAL SCORE</span>

            <div className="final-score">
              {score.toLocaleString()}
            </div>

            {score >= highScore && score > 0 ? (
              <div className="new-record">NEW HIGH SCORE</div>
            ) : null}

            <div className="result-stats">
              <div>
                <strong>{TOTAL_ROUNDS}</strong>
                <span>Rounds</span>
              </div>

              <div>
                <strong>{bestStreak}</strong>
                <span>Best streak</span>
              </div>

              <div>
                <strong>{highScore.toLocaleString()}</strong>
                <span>High score</span>
              </div>
            </div>

            <button className="start-button" onClick={startGame}>
              Play Again
            </button>
          </section>
        </div>
      </main>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <main className="whos-page">
      <div className="whos-wrap game-wrap">
        <header className="game-top">
          <div>
            <div className="game-kicker">WHO&apos;S THAT POKÉMON?</div>
            <div className="round-text">
              ROUND <strong>{round}</strong> / {TOTAL_ROUNDS}
            </div>
          </div>

          <div className="score-block">
            <span>SCORE</span>
            <strong>{score.toLocaleString()}</strong>
          </div>
        </header>

        <div className="progress-track">
          <div
            className="progress-value"
            style={{ width: `${progress}%` }}
          />
        </div>

        <section className="game-card">
          <div className="game-status">
            <div className="streak">
              {streak > 0 ? (
                <>
                  <span className="fire">🔥</span>
                  <strong>{streak}</strong>
                  <span>streak</span>
                </>
              ) : (
                <span>Keep the streak alive</span>
              )}
            </div>

            <div
              className={`timer ${
                timeLeft <= 5 ? "timer-danger" : ""
              }`}
            >
              <span>TIME</span>
              <strong>{timeLeft}</strong>
            </div>
          </div>

          <div className="silhouette-stage">
            <div
              className={`silhouette-glow ${
                timeLeft <= 5 ? "pulse" : ""
              }`}
            />

            <img
              className={`pokemon-silhouette ${
                answered ? "revealed" : ""
              }`}
              src={imageUrl(question.pokemon.id)}
              alt=""
              draggable={false}
            />

            {answered ? (
              <div className="answer-reveal">
                {question.pokemon.name}
              </div>
            ) : null}
          </div>

          {answered ? (
            <div
              className={`answer-message ${
                selected?.id === question.pokemon.id
                  ? "correct"
                  : "wrong"
              }`}
            >
              {selected?.id === question.pokemon.id
                ? "✓ Correct!"
                : `✕ It was ${question.pokemon.name}`}
            </div>
          ) : null}

          <div className="answers">
            {question.answers.map((answer) => {
              const isCorrect = answer.id === question.pokemon.id;
              const isSelected = selected?.id === answer.id;

              let answerClass = "answer-button";

              if (answered && isCorrect) {
                answerClass += " correct-answer";
              }

              if (
                answered &&
                isSelected &&
                !isCorrect
              ) {
                answerClass += " wrong-answer";
              }

              return (
                <button
                  key={answer.id}
                  className={answerClass}
                  onClick={() => answerPokemon(answer)}
                  disabled={answered}
                >
                  <span className="answer-number">
                    {String.fromCharCode(
                      65 + question.answers.indexOf(answer),
                    )}
                  </span>

                  <span>{answer.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="game-footer">
          <span>Faster answers earn more points.</span>

          <span>
            Best streak: <strong>{bestStreak}</strong>
          </span>
        </div>
      </div>
    </main>
  );
}