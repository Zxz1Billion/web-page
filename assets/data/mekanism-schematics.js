/* ============================================================================
   Mekanism multiblock schematics — feeds the shared SchematicViewer engine
   (assets/js/schematic-viewer.js). Every build is shown as top-down Y-layers,
   bottom → top, with an auto-tallied component shopping list.

   These are *representative* minimum-ish builds chosen to read clearly, not the
   only legal size. Mekanism multiblocks are dynamic: most accept any cuboid
   from their minimum up to 18×18×18. Always confirm against the in-game
   structure (Mekanism flags the exact missing block when a build is invalid).
   All components exist in Mekanism 10.3.x for MC 1.19.2 (Forge).
   ========================================================================== */

/* -------------------------------------------------- component palette */
export const PAL = {
  casing:     { label: "Structural Casing",        color: "#4a5870" },
  glass:      { label: "Structural Glass",         color: "#79b8d8" },
  valve:      { label: "Valve",                    color: "#e0573c" },
  port:       { label: "Port",                     color: "#2db3a6" },
  controller: { label: "Controller",               color: "#f2c14e" },

  // boiler / evaporation
  evap:       { label: "Thermal Evaporation Block",color: "#6f7d94" },
  heater:     { label: "Superheating Element",     color: "#e0573c" },
  disperser:  { label: "Pressure Disperser",       color: "#8893a8" },

  // turbine
  rotor:      { label: "Turbine Rotor + Blades",   color: "#cdd6e4" },
  complex:    { label: "Rotational Complex",       color: "#e8b14a" },
  coil:       { label: "Electromagnetic Coil",     color: "#b06cf0" },
  condenser:  { label: "Saturating Condenser",     color: "#46a4e6" },
  vent:       { label: "Turbine Vent",             color: "#56e3d2" },

  // fission
  rglass:     { label: "Reactor Glass",            color: "#9b7fe0" },
  fuel:       { label: "Fission Fuel Assembly",    color: "#4fd14f" },
  controlrod: { label: "Control Rod Assembly",     color: "#d94f4f" },

  // fusion
  fframe:     { label: "Reactor Frame",            color: "#6c4fb0" },
  fglass:     { label: "Reactor Glass",            color: "#b79bef" },
  laser:      { label: "Laser Focus Matrix",       color: "#f25c5c" },
};

/* --------------------------------------------------------------- utilities */
const M = {
  C: "casing", G: "glass", V: "valve", P: "port", K: "controller",
  E: "evap", H: "heater", D: "disperser",
  r: "rotor", X: "complex", c: "coil", S: "condenser", T: "vent",
  g: "rglass", F: "fuel", R: "controlrod",
  f: "fframe", w: "fglass", L: "laser",
};
const fromAscii = (rows) =>
  rows.map((line) =>
    line.split("").map((ch) => (ch === "." || ch === " " ? null : M[ch] ?? null))
  );
const f = (rows) => fromAscii(rows);

/* ============================================================ DYNAMIC TANK ==
   Hollow casing cube; interior stores fluid/chemical/slurry. Outer faces are
   Structural Casing, optionally windowed with Structural Glass; throughput is
   via Dynamic Valves. Any cuboid 3×3×3 → 18×18×18. Capacity scales with the
   interior air volume (×~16,000 mB per interior block by default). */
export const DYNAMIC_TANK = {
  title: "Dynamic Tank",
  subtitle: "fluid / chemical / slurry storage · 5×5×5 example",
  meta: { footprint: "5×5", height: "5" },
  palette: PAL, mode: "layers", segmented: false, coords: true,
  frames: [
    { label: "Y0 · floor", note: "Solid casing floor. Drop in a Dynamic Valve for piped fill/drain; a Dynamic Tank GUI also accepts buckets directly.",
      grid: f(["CCCCC", "CCCCC", "CCVCC", "CCCCC", "CCCCC"]) },
    { label: "Y1 · wall", note: "Perimeter of casing with Structural Glass windows so you can see the contents. Interior stays hollow — that air volume is your capacity.",
      grid: f(["CGGGC", "G...G", "G...G", "G...G", "CGGGC"]) },
    { label: "Y2 · wall", note: "Repeat the wall course. A 5×5×5 tank has a 3×3×3 = 27-block interior → ~432,000 mB by default.",
      grid: f(["CGGGC", "G...G", "G...G", "G...G", "CGGGC"]) },
    { label: "Y3 · wall", note: "Keep the shell sealed — every outer face must be casing, glass, or a valve. One gap and the structure won't form.",
      grid: f(["CGGGC", "G...G", "G...G", "G...G", "CGGGC"]) },
    { label: "Y4 · roof", note: "Cap with casing and a second valve for top output. Right-click any casing with a Configurator to read the formed volume.",
      grid: f(["CCCCC", "CCCCC", "CCVCC", "CCCCC", "CCCCC"]) },
  ],
};

/* ================================================ THERMAL EVAPORATION PLANT ==
   4×4 footprint, 3–18 tall, built from Thermal Evaporation Blocks with a
   Controller, up to 4 Valves, and an open top for sun/heat. Turns water into
   Brine and Brine into Lithium; also concentrates other input fluids. Pair
   with Solar Panels (heat) on the controller for speed. */
export const THERMAL_EVAP = {
  title: "Thermal Evaporation Plant",
  subtitle: "solar concentration tower · 4×4 × 5 example",
  meta: { footprint: "4×4", height: "5 (3–18)" },
  palette: PAL, mode: "layers", segmented: false, coords: true,
  frames: [
    { label: "Y0 · base", note: "Solid 4×4 of Thermal Evaporation Blocks. Two Valves on the bottom course handle input fluid in and concentrated output out.",
      grid: f(["EEEE", "VEEV", "EEEE", "EEEE"]) },
    { label: "Y1 · wall", note: "Walls rise as a hollow ring (2×2 interior cavity). Taller = faster evaporation, so build it as high as the sky allows.",
      grid: f(["EEEE", "E..E", "E..E", "EEEE"]) },
    { label: "Y2 · wall", note: "Keep stacking the ring. Height is the single biggest throughput lever on this multiblock.",
      grid: f(["EEEE", "E..E", "E..E", "EEEE"]) },
    { label: "Y3 · wall", note: "One more ring course. Up to 18 tall total.",
      grid: f(["EEEE", "E..E", "E..E", "EEEE"]) },
    { label: "Y4 · top + controller", note: "Top ring carries the Thermal Evaporation Controller on one block; the centre stays open to the sky. Heat it with Solar Panels placed on the structure for full speed.",
      grid: f(["KEEE", "E..E", "E..E", "EEEE"]) },
  ],
};

/* ================================================== THERMOELECTRIC BOILER ==
   Casing shell like the tank, but internally split by a full Pressure
   Disperser layer: water + Superheating Elements below, steam cavity above.
   Heated by hot Sodium/coolant (from a Fission Reactor) or by burning fuel.
   Outputs steam to drive an Industrial Turbine. Min 3×3×4. */
export const BOILER = {
  title: "Thermoelectric Boiler",
  subtitle: "steam generator · 5×5×5 example",
  meta: { footprint: "5×5", height: "5" },
  palette: PAL, mode: "layers", segmented: false, coords: true,
  frames: [
    { label: "Y0 · floor", note: "Casing floor with a Valve for water input. Boiler water capacity = volume below the disperser layer.",
      grid: f(["CCCCC", "CCCCC", "CCVCC", "CCCCC", "CCCCC"]) },
    { label: "Y1 · boil cavity + heaters", note: "Lower chamber holds water and hangs Superheating Elements — more elements = higher boil rate (electric boilers heat these directly).",
      grid: f(["CCCCC", "CHHHC", "CHHHC", "CHHHC", "CCCCC"]) },
    { label: "Y2 · pressure dispersers", note: "A full interior layer of Pressure Dispersers separates the water below from the steam above. This layer is mandatory.",
      grid: f(["CCCCC", "CDDDC", "CDDDC", "CDDDC", "CCCCC"]) },
    { label: "Y3 · steam cavity", note: "Hollow steam chamber. A Valve here (or a Pressure Disperser-fed pipe) carries steam out to the turbine.",
      grid: f(["CGGGC", "G...G", "G...G", "G...G", "CGGGC"]) },
    { label: "Y4 · roof", note: "Casing roof with Valves: one for steam out, one for heated-coolant return if you're using a fission heat loop.",
      grid: f(["CCVCC", "CCCCC", "CVCVC", "CCCCC", "CCVCC"]) },
  ],
};

/* ===================================================== INDUSTRIAL TURBINE ==
   Hollow casing tank with a central rotor column (Rotors + Blades), a
   Rotational Complex + Electromagnetic Coils, a Pressure Disperser layer, a
   Saturating Condenser bank, and Turbine Vents on the upper walls. Steam in at
   the bottom, Joules out via an Energy port. Min 5×5×5, up to 17×17×18. */
export const TURBINE = {
  title: "Industrial Turbine",
  subtitle: "steam → Joules · 5×5×7 example",
  meta: { footprint: "5×5", height: "7" },
  palette: PAL, mode: "layers", segmented: false, coords: true,
  frames: [
    { label: "Y0 · floor + ports", note: "Casing floor. A Valve takes steam in; an Energy Port (or Valve set to energy) pushes Joules out. The rotor column rises from the centre.",
      grid: f(["PCCCC", "CCCCC", "CCVCC", "CCCCC", "CCCCC"]) },
    { label: "Y1 · lower shaft", note: "Turbine Rotors stack up the central axis; each rotor carries Blades that fan out. More blades (taller shaft) = more steam consumed per tick.",
      grid: f(["CCCCC", "C...C", "C.r.C", "C...C", "CCCCC"]) },
    { label: "Y2 · shaft", note: "Continue the rotor column. The shaft must be one continuous run from the floor up to the Rotational Complex.",
      grid: f(["CCCCC", "C...C", "C.r.C", "C...C", "CCCCC"]) },
    { label: "Y3 · complex + coils", note: "A Rotational Complex caps the shaft; Electromagnetic Coils clip onto it (up to 8). Coils convert spin to Joules — match coil count to your blade count.",
      grid: f(["CCCCC", "C.c.C", "CcXcC", "C.c.C", "CCCCC"]) },
    { label: "Y4 · pressure dispersers", note: "A full Pressure Disperser layer separates the spinning lower chamber from the condensing upper chamber.",
      grid: f(["CCCCC", "CDDDC", "CDDDC", "CDDDC", "CCCCC"]) },
    { label: "Y5 · condensers + vents", note: "Saturating Condensers recover spent steam back to water; Turbine Vents on the upper walls set max flow. Vents and condensers together cap throughput.",
      grid: f(["CTTTC", "TSSST", "TSSST", "TSSST", "CTTTC"]) },
    { label: "Y6 · roof", note: "Seal the top with casing. Use a Configurator on the structure to read max flow, capacity, and production.",
      grid: f(["CCCCC", "CCCCC", "CCCCC", "CCCCC", "CCCCC"]) },
  ],
};

/* ======================================================== FISSION REACTOR ==
   Casing cube (3×3×4 → 18³) with Reactor Glass windows. Interior is filled
   with Fission Fuel Assembly columns, each topped by a Control Rod Assembly.
   Ports handle coolant in, heated coolant / steam out, fissile fuel in, and
   nuclear waste out. Burns Fissile Fuel; cool it or it MELTS DOWN. */
export const FISSION = {
  title: "Fission Reactor",
  subtitle: "heat / steam source · 5×5×5 example",
  meta: { footprint: "5×5", height: "5" },
  palette: PAL, mode: "layers", segmented: false, coords: true,
  frames: [
    { label: "Y0 · floor + ports", note: "Casing floor. Reactor Ports (set by face) handle coolant in, heated coolant/steam out, fissile fuel in, and waste out — at least one of each.",
      grid: f(["PCCCP", "CCCCC", "CCCCC", "CCCCC", "PCCCP"]) },
    { label: "Y1 · fuel assemblies", note: "Walls of casing + Reactor Glass; the interior is packed with Fission Fuel Assemblies. Each assembly column raises burn rate and heat output.",
      grid: f(["CGGGC", "GFFFG", "GFFFG", "GFFFG", "CGGGC"]) },
    { label: "Y2 · fuel assemblies", note: "Fuel columns continue straight up. Keep coolant supply well ahead of burn rate — overheating damages the reactor and leaks radiation.",
      grid: f(["CGGGC", "GFFFG", "GFFFG", "GFFFG", "CGGGC"]) },
    { label: "Y3 · control rods", note: "Each fuel column is capped at the top by a Control Rod Assembly. This is what actually sets the maximum burn rate of that column.",
      grid: f(["CGGGC", "GRRRG", "GRRRG", "GRRRG", "CGGGC"]) },
    { label: "Y4 · roof", note: "Casing roof, optionally with a Reactor Logic Adapter for redstone scram control. SCRAM the reactor before it ever hits 1,200 K.",
      grid: f(["CCCCC", "CCPCC", "CCCCC", "CCPCC", "CCCCC"]) },
  ],
};

/* ========================================================= FUSION REACTOR ==
   Fixed octahedral shell of Reactor Frame edges + Reactor Glass faces, with a
   Reactor Controller, Reactor Ports, a Laser Focus Matrix, and a Hohlraum
   (D-T fuel) ignited by a charged Laser. Cross-sections below are a simplified
   octahedron — build it against the in-game structure helper. */
export const FUSION = {
  title: "Fusion Reactor (representative)",
  subtitle: "octahedron cross-sections · bottom → top",
  meta: { footprint: "5×5 bounding", height: "5" },
  palette: PAL, mode: "layers", segmented: false, coords: true,
  frames: [
    { label: "Y0 · lower point", note: "The octahedron tapers to a single Reactor Frame block at the bottom point.",
      grid: f([".....", ".....", "..f..", ".....", "....."]) },
    { label: "Y1 · lower ring", note: "A small frame-and-glass ring. The frame runs the edges; glass fills the faces.",
      grid: f(["..f..", ".fwf.", "fwwwf", ".fwf.", "..f.."]) },
    { label: "Y2 · equator", note: "Widest cross-section. The Reactor Controller, Reactor Ports and the Laser Focus Matrix sit on this band; the hollow centre holds the plasma.",
      grid: f([".fLf.", "fw.wf", "K...P", "fw.wf", ".fwf."]) },
    { label: "Y3 · upper ring", note: "Mirror of the lower ring as the shell closes back in.",
      grid: f(["..f..", ".fwf.", "fwwwf", ".fwf.", "..f.."]) },
    { label: "Y4 · upper point", note: "A single Reactor Frame block caps the top point. Insert a fuelled Hohlraum and fire the charged Laser to ignite.",
      grid: f([".....", ".....", "..f..", ".....", "....."]) },
  ],
};

/* --------------------------------------------------------------- registry */
export const MULTIBLOCKS = {
  tank: DYNAMIC_TANK,
  evap: THERMAL_EVAP,
  boiler: BOILER,
  turbine: TURBINE,
  fission: FISSION,
  fusion: FUSION,
};
