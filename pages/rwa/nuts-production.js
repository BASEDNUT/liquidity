import Head from "next/head";
import Link from "next/link";
import Layout from "../../components/Layout";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
  Grid,
} from "@mui/material";

// Orchard theme tokens
const BARK = "#5D3A1A";
const OAT = "#7D5A50";
const HONEY = "#A67C52";
const CREAM = "#F5E9DA";
const PARCHMENT = "#FFFDF7";
const MOSS = "#496A49";
const OCHRE = "#C68B36";

const HERO_STATS = [
  { value: "$13.1B", label: "2025 value of six major U.S. tree-nut crops" },
  { value: "$14.84B", label: "2025 tree nuts + peanuts, constructed from USDA crop values" },
  { value: "$12.1B", label: "2025 value of California almonds, pistachios and walnuts" },
  { value: "$8.8B", label: "2024 California exports: almonds, pistachios and walnuts" },
];

const CROPS = [
  { region: "California", crop: "Almonds", value: "$6.87B", production: "2.715B lb shelled", coproduct: "Hulls → dairy feed. Shells → bedding and soil uses. Trees → whole-orchard recycling and biomass." },
  { region: "California", crop: "Pistachios", value: "$3.92B", production: "1.58B lb in-shell", coproduct: "Shells → farm-road surfacing. Hulls, leaves and branches → compost at some processors. Higher-value uses remain R&D." },
  { region: "California", crop: "Walnuts", value: "$1.30B", production: "809,000 tons", coproduct: "Shells are a concentrated processing stream. USDA is developing shell-based activated carbon." },
  { region: "Georgia + Southeast", crop: "Peanuts", value: "$1.78B", production: "7.18B lb across 11 USDA states", coproduct: "Shelling creates shells; blanching creates skins; crushing creates oil and meal." },
  { region: "Oregon", crop: "Hazelnuts", value: "$340M", production: "121,500 tons", coproduct: "Processors make oil, flour, meal, paste and praline. Shell-to-heat and biochar systems are being engineered." },
  { region: "Southwest + Georgia", crop: "Pecans", value: "$596M", production: "284.3M lb across five USDA states", coproduct: "Commercial plants handle shell and fiber streams. USDA studies composted shells and better shelling." },
  { region: "Hawaii", crop: "Macadamias", value: "$31.8M", production: "30.6M lb in-shell", coproduct: "Shells → process energy, mulch and other material uses. Culled kernels → specialty oil." },
];

const COPRODUCTS = [
  { emoji: "🌾", title: "Almond hulls → feed", stage: "In use", body: "A large existing dairy-feed market. UC ANR estimates roughly $160M–$230M/year in hull value." },
  { emoji: "🥜", title: "Shells → soil + bedding", stage: "In use + expanding", body: "Almond shells have established bedding uses; UC is evaluating direct orchard return as a potassium amendment and mulch." },
  { emoji: "🔥", title: "Shells → factory energy", stage: "In use", body: "Real in Hawaii: Mauna Loa has used macadamia shells and waste as biofuel at Keaʻau." },
  { emoji: "🧪", title: "Peanut skins → ingredients", stage: "R&D", body: "USDA estimates 40M–70M lb of skins removed each year, developing food/feed uses around nutrients and bioactives." },
  { emoji: "🫙", title: "Kernels → oil, flour + meal", stage: "Market + pilot", body: "Established in peanuts and hazelnuts, plus specialty macadamia oil. Pecan oil/flour tested at pilot scale." },
  { emoji: "⚡", title: "Shell carbon → advanced materials", stage: "R&D", body: "USDA is developing shell-derived activated carbon and, in a 2026 project, peanut-shell biographite for lithium-battery anodes." },
];

const REGIONS = [
  { region: "California · Central Valley", title: "The orchard sea", body: "Dry Central Valley supports vast almond, pistachio and walnut orchards through managed water, pollination and dense processing infrastructure.", after: "After harvest: hulls → dairy feed; shells → mulch, bedding or energy; orchard wood → soil or biochar." },
  { region: "Oregon · Willamette Valley", title: "The hazelnut basin", body: "Oregon's wetter Willamette Valley is the center of U.S. hazelnut production, rebuilt around disease-resistant cultivars.", after: "After harvest: shells → long-lived mulch, heat and biochar research." },
  { region: "Georgia + Southeast · Coastal Plain", title: "The underground harvest", body: "Peanuts grow underground in annual rotations across Georgia and the Southeast, tied to shellers, crushers and food manufacturers.", after: "After processing: shells → biomass; skins → ingredients; crushing → oil + protein-rich meal." },
  { region: "New Mexico + Southwest · River valleys", title: "The desert canopy", body: "Pecans follow irrigation through New Mexico and the Southwest, creating long-lived green orchards in hot, arid valleys.", after: "After harvest: shells, husks and wood → mulch, compost, biochar, energy and biomaterials." },
  { region: "Hawaii · Tropical orchards", title: "The island nut", body: "Hawaii's macadamia orchards pair oil-rich kernels with unusually hard shells, making local reuse especially valuable.", after: "After harvest: shells → fuel or mulch; husks → compost; culled kernels → oil; press cake → feed." },
];

export default function NutsProduction() {
  return (
    <Layout>
      <Head>
        <title>America Runs on Nuts — RWA | BASED NUT</title>
        <meta
          name="description"
          content="The geography, farm value, production and coproduct economy of American almonds, pistachios, walnuts, peanuts, pecans, hazelnuts and macadamias — verified USDA data."
        />
      </Head>

      <Box sx={{ maxWidth: 1060, mx: "auto", px: 2, py: 5 }}>
        <Typography variant="overline" sx={{ color: HONEY, fontWeight: 800, letterSpacing: 2 }}>
          🏦 Real-World Assets
        </Typography>
        <Typography variant="h3" sx={{ color: BARK, fontWeight: 900, letterSpacing: -1, mb: 2 }}>
          America runs on nuts.
        </Typography>
        <Typography sx={{ color: "#423B31", fontSize: "1.15rem", maxWidth: 760, mb: 4 }}>
          From California almonds to Georgia peanuts, U.S. nut farming is a multi-billion-dollar
          network of regional economies. The kernel is only the start: hulls, shells, skins, oils,
          meals and orchard wood also have value.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 5 }}>
          {HERO_STATS.map((s) => (
            <Grid item xs={12} sm={6} key={s.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: PARCHMENT,
                  border: "1px solid #D9CFBF",
                  borderRadius: 3,
                }}
              >
                <Typography sx={{ color: BARK, fontWeight: 900, fontSize: "2rem", letterSpacing: -1 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ color: "#6B6254", fontSize: "0.9rem", mt: 1 }}>
                  {s.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h5" sx={{ color: BARK, fontWeight: 800, mb: 2 }}>
          A crop can define a state
        </Typography>
        <Typography sx={{ color: "#4B4338", mb: 3 }}>
          Seven crops anchor distinct regional economies. Values are 2025 USDA farm-production
          estimates; coproduct uses are labeled by evidence stage.
        </Typography>
        <Grid container spacing={2} sx={{ mb: 5 }}>
          {CROPS.map((c) => (
            <Grid item xs={12} sm={6} md={4} key={c.crop}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: CREAM,
                  border: "1px solid #D9CFBF",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <Typography sx={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800, color: MOSS }}>
                  {c.region}
                </Typography>
                <Typography sx={{ color: BARK, fontWeight: 900, fontSize: "1.4rem", mt: 0.5 }}>
                  {c.crop}
                </Typography>
                <Typography sx={{ color: HONEY, fontWeight: 900, fontSize: "1.8rem", letterSpacing: -1 }}>
                  {c.value}
                </Typography>
                <Typography sx={{ color: "#6B6254", fontSize: "0.85rem", mt: 0.5 }}>
                  {c.production}
                </Typography>
                <Divider sx={{ my: 1.5, borderColor: "#D1B48C" }} />
                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>
                  <b style={{ color: OAT }}>Beyond the kernel:</b> {c.coproduct}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h5" sx={{ color: BARK, fontWeight: 800, mb: 2 }}>
          What leaves the factory besides food?
        </Typography>
        <Typography sx={{ color: "#4B4338", mb: 3 }}>
          Six high-value coproduct streams. The label tells whether the use exists today or is
          still being developed.
        </Typography>
        <Grid container spacing={2} sx={{ mb: 5 }}>
          {COPRODUCTS.map((b) => (
            <Grid item xs={12} sm={6} md={4} key={b.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: PARCHMENT,
                  border: "1px solid #D9CFBF",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <Typography sx={{ fontSize: "2rem", lineHeight: 1, mb: 1 }}>{b.emoji}</Typography>
                <Typography sx={{ color: BARK, fontWeight: 800, mb: 0.5 }}>{b.title}</Typography>
                <Typography sx={{ color: "#51483C", fontSize: "0.9rem", mb: 1.5 }}>{b.body}</Typography>
                <Chip
                  label={b.stage}
                  size="small"
                  sx={{
                    bgcolor: b.stage === "In use" || b.stage === "In use + expanding" ? "#E9F0E6" : "#F3E5C9",
                    color: b.stage === "In use" || b.stage === "In use + expanding" ? "#345237" : "#6D491D",
                    fontWeight: 800,
                    fontSize: "0.7rem",
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 5, borderColor: "#D1B48C" }} />

        <Typography variant="h5" sx={{ color: BARK, fontWeight: 800, mb: 2 }}>
          Seven crops, five Americas
        </Typography>
        <Typography sx={{ color: "#4B4338", mb: 3 }}>
          A nut carries its geography with it: climate, water, soil, labor, pollinators,
          processors and trade, compressed into one crop.
        </Typography>
        <Stack spacing={2}>
          {REGIONS.map((r) => (
            <Paper
              key={r.title}
              elevation={0}
              sx={{
                p: 3,
                bgcolor: BARK,
                color: "#FFF7E7",
                borderRadius: 3,
              }}
            >
              <Typography sx={{ color: OCHRE, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>
                {r.region}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", mt: 0.5 }}>
                {r.title}
              </Typography>
              <Typography sx={{ color: "#D9CDBB", fontSize: "0.95rem", mt: 1 }}>
                {r.body}
              </Typography>
              <Typography sx={{ color: "#F0CF97", fontSize: "0.88rem", mt: 1.5 }}>
                {r.after}
              </Typography>
            </Paper>
          ))}
        </Stack>

        <Paper
          elevation={0}
          sx={{
            mt: 5,
            p: 3,
            bgcolor: CREAM,
            borderLeft: "4px solid #C68B36",
            borderRadius: 2,
          }}
        >
          <Typography sx={{ fontWeight: 800, color: BARK, mb: 1 }}>
            🧾 Evidence rule
          </Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.93rem" }}>
            “In use” means a direct source documents an operating use. “Industrial product” means
            the item is commercially offered or manufactured. “R&D / pilot” means the pathway is
            being tested and should not be counted as an established market. Primary evidence is
            linked inline throughout the source page.
          </Typography>
        </Paper>

        <Box sx={{ mt: 5, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Link href="/rwa/carbon-debt" passHref style={{ textDecoration: "none" }}>
            <Chip
              clickable
              label="🌍 Carbon Debt Ledger"
              sx={{ bgcolor: OAT, color: "#FFF", fontWeight: 700 }}
            />
          </Link>
          <Link href="/tree" passHref style={{ textDecoration: "none" }}>
            <Chip
              clickable
              label="🌳 Back to the Tree"
              sx={{ bgcolor: CREAM, color: BARK, fontWeight: 700, border: "1px solid #D1B48C" }}
            />
          </Link>
        </Box>
      </Box>
    </Layout>
  );
}
