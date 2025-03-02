import { connect } from "mongoose"
import { City } from "./models/city.model"
import { MONGO_URL } from "./config"

export const cities = [
    {
        "city": "Rome",
        "country": "Italy",
        "clues": [
            "This city contains an independent country within its borders.",
            "Famous for ancient ruins like the Colosseum and Forum."
        ],
        "fun_fact": [
            "The Trevi Fountain collects about €3,000 daily in coins, which is donated to charity.",
            "Romans invented apartment living—ancient insulae housed over 1 million people."
        ],
        "trivia": [
            "The Spanish Steps have 135 steps but are named after the Spanish Embassy nearby.",
            "All roads literally led to this city in ancient times via the Roman road system."
        ]
    },
    {
        "city": "Sydney",
        "country": "Australia",
        "clues": [
            "Home to an opera house with sail-shaped roofs.",
            "Features one of the world's largest natural harbors."
        ],
        "fun_fact": [
            "The Sydney Harbour Bridge took 8 years to paint—and needs constant repainting!",
            "Sydney's New Year's Eve fireworks are seen by 1 billion people globally."
        ],
        "trivia": [
            "Bondi Beach has a pool carved directly into ocean rocks.",
            "The Great Barrier Reef is visible from space but not from Sydney."
        ]
    },
    {
        "city": "Rio de Janeiro",
        "country": "Brazil",
        "clues": [
            "Hosted a famous Carnival celebration with samba parades.",
            "Features a massive statue of Christ with outstretched arms."
        ],
        "fun_fact": [
            "Copacabana Beach's wave pattern was inspired by Portuguese sidewalks.",
            "Rio means 'River of January'—a misnomer as there's no river."
        ],
        "trivia": [
            "The Maracanã Stadium held 200,000 people for the 1950 World Cup.",
            "Favela communities make up about 25% of the city's population."
        ]
    },
    // ... (17 more entries continued below)
    {
        "city": "Cape Town",
        "country": "South Africa",
        "clues": [
            "Located near the southernmost point of Africa.",
            "Features a flat-topped mountain visible across the city."
        ],
        "fun_fact": [
            "Table Mountain has more plant species than the entire UK.",
            "Penguins live on beaches just 30 minutes from downtown."
        ],
        "trivia": [
            "The Noon Gun has fired daily since 1806 (except Sundays).",
            "Hosted the first successful human heart transplant in 1967."
        ]
    },
    {
        "city": "Dubai",
        "country": "UAE",
        "clues": [
            "Home to the world's tallest building and artificial islands.",
            "Has indoor ski slopes in the middle of the desert."
        ],
        "fun_fact": [
            "The Burj Khalifa's height is exactly 828 meters for cultural significance.",
            "Dubai Police use Lamborghinis and Bugattis as patrol cars."
        ],
        "trivia": [
            "Less than 15% of Dubai's population are native Emiratis.",
            "Gold vending machines dispense 24-karat gold bars in malls."
        ]
    }, {
        "city": "Paris",
        "country": "France",
        "clues": [
            "This city is home to a famous tower that sparkles every night.",
            "Known as the 'City of Love' and a hub for fashion and art."
        ],
        "fun_fact": [
            "The Eiffel Tower was supposed to be dismantled after 20 years but was saved because it was useful for radio transmissions!",
            "Paris has only one stop sign in the entire city—most intersections rely on priority-to-the-right rules."
        ],
        "trivia": [
            "This city is famous for its croissants and macarons. Bon appétit!",
            "Paris was originally a Roman city called Lutetia."
        ]
    },
    {
        "city": "Tokyo",
        "country": "Japan",
        "clues": [
            "This city has the busiest pedestrian crossing in the world.",
            "You can visit an entire district dedicated to anime, manga, and gaming."
        ],
        "fun_fact": [
            "Tokyo was originally a small fishing village called Edo before becoming the bustling capital it is today!",
            "More than 14 million people live in Tokyo, making it one of the most populous cities in the world."
        ],
        "trivia": [
            "The city has over 160,000 restaurants, more than any other city in the world.",
            "Tokyo’s subway system is so efficient that train delays of just a few minutes come with formal apologies."
        ]
    },
    {
        "city": "New York",
        "country": "USA",
        "clues": [
            "Home to a green statue gifted by France in the 1800s.",
            "Nicknamed 'The Big Apple' and known for its Broadway theaters."
        ],
        "fun_fact": [
            "The Statue of Liberty was originally a copper color before oxidizing to its iconic green patina.",
            "Times Square was once called Longacre Square before being renamed in 1904."
        ],
        "trivia": [
            "New York City has 468 subway stations, making it one of the most complex transit systems in the world.",
            "The Empire State Building has its own zip code: 10118."
        ]
    },
    {
        "city": "Marrakech",
        "country": "Morocco",
        "clues": [
            "Famous for its red-walled medina and bustling souks.",
            "Home to the vibrant Jemaa el-Fnaa square with storytellers and snake charmers."
        ],
        "fun_fact": [
            "The city's walls were painted pink in 1956 to welcome Queen Salima of Iran.",
            "Marrakech means 'Land of God' in the Berber language."
        ],
        "trivia": [
            "The Atlas Mountains near Marrakech are home to snow-capped peaks in winter.",
            "Many scenes from 'Casablanca' were actually filmed in Marrakech."
        ]
    },
    {
        "city": "Amsterdam",
        "country": "Netherlands",
        "clues": [
            "Known for its elaborate canal system and narrow houses.",
            "Museum district includes works by Van Gogh and Rembrandt."
        ],
        "fun_fact": [
            "There are more bicycles (881,000) than people (821,000) in the city.",
            "Amsterdam's buildings tilt forward to prevent furniture from hitting facades during moves."
        ],
        "trivia": [
            "Tulips sold at the floating flower market are actually grown outside the city.",
            "The narrowest house in Amsterdam is just 2.02 meters wide."
        ]
    },
    {
        "city": "Bangkok",
        "country": "Thailand",
        "clues": [
            "Famous for floating markets and golden Buddhist temples.",
            "Home to the 46-meter-long reclining Buddha at Wat Pho."
        ],
        "fun_fact": [
            "Bangkok's full ceremonial name is 168 letters long (world's longest city name).",
            "The city holds the Guinness record for world's hottest city (avg 29°C/84°F)."
        ],
        "trivia": [
            "Street food stalls outnumber restaurants 10-to-1.",
            "Tuk-tuks get their name from the sound of their small two-stroke engines."
        ]
    },
    {
        "city": "Buenos Aires",
        "country": "Argentina",
        "clues": [
            "Known as the 'Paris of South America' for its European architecture.",
            "Birthplace of the tango dance and home to colorful La Boca district."
        ],
        "fun_fact": [
            "The city has more bookstores per capita than any other city in the world.",
            "Porteños (locals) eat dinner later than anywhere else (often after 10 PM)."
        ],
        "trivia": [
            "Evita Perón's grave receives more visitors than any other in Recoleta Cemetery.",
            "Avenida 9 de Julio is the widest avenue in the world (110 meters/361 ft)."
        ]
    },
    {
        "city": "Vancouver",
        "country": "Canada",
        "clues": [
            "Surrounded by mountains and ocean with a massive urban park.",
            "Known as 'Hollywood North' for its film production industry."
        ],
        "fun_fact": [
            "Stanley Park is 10% larger than New York's Central Park.",
            "Vancouver's tap water comes from mountain reservoirs and is purer than bottled water."
        ],
        "trivia": [
            "Over 50% of residents speak a language other than English at home.",
            "The Capilano Suspension Bridge sways 110 meters above a rainforest canyon."
        ]
    }

]

const seedData = async () => {
    connect(MONGO_URL || "").then(async () => {
        await City.insertMany(cities).then(() => {
            console.log("Successfully Added")
        }).catch((err: any) => {
            console.log(err)
        });
    }).catch((err: any) => {
        console.log(err)
    })
}

seedData()