const CATEGORIES = {
  SPEED: {
    KMH: { name: "Kilometres per hour", abb: "Km/h" },
    MPH: { name: "Miles per hour", abb: "mph" },
    KT: { name: "Knots", abb: "Knots" },
  },
  DISTANCE: {
    KM: { name: "Kilometres", abb: "Km" },
    MI: { name: "Miles", abb: "mi" },
    M: { name: "Metre", abb: "m" },
    YD: { name: "Yard", abb: "yd" },
    FT: { name: "Feet", abb: "ft" },
    CM: { name: "Centimetres", abb: "cm" },
    IN: { name: "Inches", abb: "in" },
  },
  MASS: {
    KG: { name: "Kilograms", abb: "Kg" },
    LBS: { name: "Pounds", abb: "lbs" },
  },
  VOLUME: {
    L: { name: "Litres", abb: "L" },
    GAL: { name: "Gallons", abb: "gal" },
    ML: { name: "Millilitres", abb: "ml" },
    OZ: { name: "Ounces", abb: "oz" },
  },
  TEMPERATURE: {
    C: { name: "Celsius", abb: "C" },
    F: { name: "Fahrenheit", abb: "F" },
    K: { name: "Kelvin", abb: "K" },
  },
};

const CONVERSIONS = {
  SPEED: {
    KMH: { MPH: 0.621371, KT: 0.539957 },
    MPH: { KMH: 1.60934, KT: 0.868976 },
    KT: { KMH: 1.852, MPH: 1.15078 },
  },
  DISTANCE: {
    KM: { M: 1000, MI: 0.621371, YD: 1093.61, FT: 3280.84, CM: 100000, IN: 39370.1 },
    MI: { KM: 1.60934, M: 1609.34, YD: 1760, FT: 5280, CM: 160934, IN: 63360 },
    M: { KM: 0.001, MI: 0.000621371, YD: 1.09361, FT: 3.28084, CM: 100, IN: 39.3701 },
    YD: { KM: 0.0009144, MI: 0.000568182, M: 0.9144, FT: 3, CM: 91.44, IN: 36 },
    FT: { KM: 0.0003048, MI: 0.000189394, M: 0.3048, YD: 0.333333, CM: 30.48, IN: 12 },
    CM: { KM: 0.00001, MI: 0.0000062137, M: 0.01, YD: 0.0109361, FT: 0.0328084, IN: 0.393701 },
    IN: { KM: 0.0000254, MI: 0.0000157828, M: 0.0254, YD: 0.0277778, FT: 0.0833333, CM: 2.54 },
  },
  MASS: { KG: { LBS: 2.20462 }, LBS: { KG: 0.453592 } },
  VOLUME: {
    L: { ML: 1000, OZ: 33.814, GAL: 0.264172 },
    GAL: { L: 3.78541, OZ: 128, ML: 3785.41 },
    ML: { OZ: 0.033814, L: 0.001, GAL: 0.000264172 },
    OZ: { ML: 29.5735, L: 0.0295735, GAL: 0.0078125 },
  },
  TEMPERATURE: {
    C: {
      F: (val) => (val * 9) / 5 + 32,
      K: (val) => val + 273.15,
    },
    F: {
      C: (val) => ((val - 32) * 5) / 9,
      K: (val) => ((val - 32) * 5) / 9 + 273.15,
    },
    K: {
      C: (val) => val - 273.15,
      F: (val) => ((val - 273.15) * 9) / 5 + 32,
    },
  },
};

const fromOptions = document.getElementById("from-options");
const toOptions = document.getElementById("to-options");
const inputElement = document.getElementById("input");
const outputElement = document.getElementById("output");

let fromUnit = null;
let toUnit = null;

inputElement.addEventListener("input", convert);

// Iterate through the categories to add them to the "from unit dropdown" and get its unit options
const categories = CATEGORIES;
for (const category in categories) {
  // Add the category to the dropdown
  const categoryTitle = document.createElement("div");
  categoryTitle.textContent = category;
  categoryTitle.style.fontWeight = "bold";
  categoryTitle.style.textAlign = "center";
  categoryTitle.style.padding = "0.3rem";
  categoryTitle.style.backgroundColor = "#8bc9c1";
  fromOptions.appendChild(categoryTitle);

  // Get category unit options
  addOptions(categories[category], "from-button", fromOptions, category);
}

function addOptions(options, buttonId, content, category) {
  // If it's "to unit button", remove all of the options that are incompatible with the "from unit button"
  if (buttonId === "to-button") content.innerHTML = "";

  // Iterate through the options in each category to add them to the dropdown
  for (const unit in options) {
    // Create a new element in the dropdown and give it the option's data
    const a = document.createElement("a");
    a.textContent = `${options[unit].abb} (${options[unit].name})`;

    // Unit option has been selected
    a.addEventListener("click", () => {
      document.getElementById(buttonId).textContent = options[unit].abb;

      // Save the selected unit accordingly to the button
      if (buttonId === "from-button") {
        fromUnit = unit;

        // Clear the "to-button" to ensure in has no incompatible unit assigned from a previous conversion
        toUnit = null;
        document.getElementById("to-button").textContent = "To";

        // Create the compatible options in the dropdown based on the selected "from unit's" category
        addOptions(categories[category], "to-button", toOptions, category);
      } else {
        toUnit = unit;
      }

      // Both units have now been selected, convert them
      convert();
    });

    content.appendChild(a);
  }
}

function convert() {
  if (fromUnit && toUnit && inputElement.value) {
    const input = parseFloat(inputElement.value);
    // Get the category to access the conversion parameters
    const category = Object.keys(categories).find((cat) => categories[cat][fromUnit]);

    let result;
    if (typeof CONVERSIONS[category][fromUnit][toUnit] === "function") {
      // Complex conversion (temperature)
      result = CONVERSIONS[category][fromUnit][toUnit](input);
    } else {
      // Simple conversion
      result = input * CONVERSIONS[category][fromUnit][toUnit];
    }

    outputElement.value = result?.toFixed(2);
  }
}

// Copy result button
const copyButton = document.getElementById("copy");
copyButton.addEventListener("click", () => {
  const resultText = outputElement.value;

  if (!resultText) {
    return
  }

  try {
    navigator.clipboard.writeText(resultText);
  } catch (error) {
    alert("Failed to copy the result")
    console.error("Failed to copy the result: ", error);
  }
});