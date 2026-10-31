// Lulu Artisan Goods catalog. Edit prices, names and descriptions here.
// price: number used for the estimate (null = "ask").
// priceLabel: what customers see.
// bundle: [count, price] deal, e.g. 2 for $10.
// fabric: true lets customers pick a print from the fabric library.
// options: choices that add to the price.

window.CATALOG = [
  {
    id: "sewn", title: "Sewn essentials", sub: "Useful pieces, made with a little personality.",
    items: [
      { id: "bread-bag", name: "Beeswax Bread Bag", price: 10, img: "beeswax-bread-bag",
        desc: "Cotton coated with beeswax and jojoba, made for everyday loaves." },
      { id: "book-sleeve", name: "Quilted Book Sleeve", price: 15, img: "quilted-book-sleeve", fabric: true,
        desc: "A softly padded home for your current read, journal, or Bible." },
      { id: "fabric-basket", name: "Fabric Basket", price: 12, img: "fabric-basket", fabric: true,
        desc: "A cheerful catch-all for shelves, toys, and the little things." },
      { id: "beeswax-wraps", name: "Beeswax Wraps", price: 5, priceLabel: "From $5", img: "beeswax-wraps",
        desc: "Reusable cotton wraps for leftovers, snacks, and less plastic." }
    ]
  },
  {
    id: "extras", title: "The little extras", sub: "Small details. Plenty of personality.",
    items: [
      { id: "wristlet", name: "Scrunchie Wristlet", price: 5, img: "scrunchie-wristlet", fabric: true,
        desc: "Your keys deserve better than the bottom of your bag." },
      { id: "keychain-scarf", name: "Keychain Scarf", price: 6, priceLabel: "$6 · 2 for $10", bundle: [2, 10], img: "keychain-scarf", fabric: true,
        desc: "A little personality for keys, bags, and totes." },
      { id: "fabric-keychain", name: "Fabric Keychain", price: 5, img: "fabric-keychain", fabric: true,
        desc: "Handmade from pretty cotton prints and metal hardware." },
      { id: "bookmark", name: "Fabric Bookmark", price: 4, img: "fabric-bookmark", fabric: true,
        desc: "A tiny treat for your next chapter." },
      { id: "banner", name: "Personalized Banner", price: 18, priceLabel: "From $18", img: "personalized-banner", fabric: true,
        desc: "Custom fabric names for rooms and celebrations. Add the name in your order notes." },
      { id: "scrunchies", name: "Fabric Scrunchies", price: null, priceLabel: "Ask for colors", img: "fabric-scrunchies",
        desc: "Soft cotton favorites in assorted prints." }
    ]
  },
  {
    id: "bags", title: "Bags for wherever", sub: "Handmade, not mass produced. Lining included in all tote prices.",
    items: [
      { id: "everyday-tote", name: "Everyday Cotton Tote", price: 16, priceLabel: "From $16", img: "everyday-tote", fabric: true,
        desc: "Fully lined and reversible.",
        options: [
          { label: "Size", choices: [["Small", 0], ["Medium", 3], ["Large", 6]] },
          { label: "Batting", choices: [["None", 0], ["Polyester batting + quilting", 5], ["Cotton batting + quilting", 7]] }
        ] },
      { id: "patchwork-tote", name: "Patchwork Tote", price: 29, priceLabel: "From $29", img: "patchwork-tote",
        desc: "Coordinating prints, fully lined and reversible.",
        options: [
          { label: "Strip collection", choices: [["Cottagecore", 0], ["Star Dune", 0], ["Desert Dusk", 0]] },
          { label: "Batting", choices: [["None", 0], ["Polyester batting + quilting", 5], ["Cotton batting + quilting", 7]] }
        ] },
      { id: "hot-pad", name: "Casserole Hot Pad", price: 15, img: "casserole-hot-pad",
        desc: "Colorful cotton patchwork, insulated for hot dishes." }
    ]
  },
  {
    id: "bakes", title: "From the oven", sub: "Small-batch bakes made to share.",
    items: [
      { id: "sourdough", name: "Artisan Sourdough", price: 9, img: "artisan-sourdough",
        desc: "Slow-fermented, crusty, and worth the wait." },
      { id: "sandwich-bread", name: "Sandwich Bread", price: 7, img: "sandwich-bread",
        desc: "Soft, sliceable bread made with sourdough discard." },
      { id: "banana-bread", name: "Banana Walnut Bread", price: 12, img: "banana-walnut-bread",
        desc: "Tender banana bread, honey, and walnuts." },
      { id: "cinnamon-cookies", name: "Cinnamon Chunk Cookies", price: 12, priceLabel: "$12 / dozen", unit: "dozen", img: "cinnamon-chunk-cookies",
        desc: "Chewy sourdough cookies with cinnamon-sugar pockets." },
      { id: "choc-chip-cookies", name: "Chocolate Chip Cookies", price: 12, priceLabel: "$12 / dozen", unit: "dozen", img: "chocolate-chip-cookies",
        desc: "Classic cookies with a sourdough twist." },
      { id: "granola-bars", name: "Sourdough Granola Bars", price: 2, priceLabel: "$2 each · 6 for $10", bundle: [6, 10], img: "sourdough-granola-bars",
        desc: "Oats, honey, peanut butter, and chocolate chips." }
    ]
  },
  {
    id: "pantry", title: "Pantry & home", sub: "A few favorites for the everyday.",
    items: [
      { id: "pancake-mix", name: "Sourdough Pancake Mix", price: 6, img: "sourdough-pancake-mix",
        desc: "A little sourdough magic for a slow morning." },
      { id: "apple-butter", name: "Spiced Apple Butter", price: 7, img: "spiced-apple-butter",
        desc: "Slow-cooked apples and cozy spices in a jar." },
      { id: "vanilla", name: "Small-Batch Vanilla", price: 10, img: "small-batch-vanilla",
        desc: "4 oz amber bottle, fragrant extract for baking and gifting." },
      { id: "candles", name: "Hand-Poured Candles", price: 10, priceLabel: "From $10", img: "hand-poured-candles",
        desc: "Small-batch scents for moments worth slowing down. Ask about scents in your notes." }
    ]
  }
];

window.FABRICS = [
  ["Tea Dye Bees", "fabric-tea-dye-bees"], ["Charcoal Floral", "fabric-charcoal-floral"],
  ["Diamond Rose", "fabric-diamond-rose"], ["Black Stripe", "fabric-black-stripe"],
  ["Ecru Stripe", "fabric-ecru-stripe"], ["Earth Botanical", "fabric-earth-botanical"],
  ["Blue Dandelion", "fabric-blue-dandelion"], ["Greige Stripe", "fabric-greige-stripe"],
  ["Green Floral", "fabric-green-floral"], ["Red Gingham", "fabric-red-gingham"],
  ["Sage Plaid", "fabric-sage-plaid"], ["Navy Dots", "fabric-navy-dots"],
  ["Evergreen", "fabric-evergreen"], ["Onyx", "fabric-onyx"]
];

window.STRIPS = [
  ["Cottagecore", "patchwork-cottagecore"], ["Star Dune", "patchwork-star-dune"], ["Desert Dusk", "patchwork-desert-dusk"]
];
