(() =>
{
  const TOOLKIT_CONFIG_URL = "/stem-toolkits/data/categories.json";
  const toolConfigMap = new WeakMap();
  const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6
  });

  const baseDigitValidators = {
    2: /^-?[01]+$/i,
    8: /^-?[0-7]+$/i,
    10: /^-?\d+$/i,
    16: /^-?[0-9a-f]+$/i
  };

  const supportedBases = Object.keys(baseDigitValidators)
    .map((base) => Number.parseInt(base, 10))
    .sort((left, right) => left - right);

  function getBaseDigitHint(base)
  {
    if (base === 2)
    {
      return "Use only 0 and 1 (optional leading + or -).";
    }

    if (base === 8)
    {
      return "Use digits 0-7 (optional leading + or -).";
    }

    if (base === 10)
    {
      return "Use digits 0-9 (optional leading + or -).";
    }

    if (base === 16)
    {
      return "Use digits 0-9 and A-F (optional leading + or -).";
    }

    return "Use digits valid for the selected base (optional leading + or -).";
  }

  function getMinimumTemperature(scale)
  {
    if (scale === "c")
    {
      return -273.15;
    }

    if (scale === "f")
    {
      return -459.67;
    }

    if (scale === "k")
    {
      return 0;
    }

    return null;
  }

  function parseBigIntFromBase(value, base)
  {
    if (typeof value !== "string")
    {
      throw new TypeError("value must be a string");
    }

    const trimmed = value.trim();
    if (!trimmed.length)
    {
      throw new Error("Empty value");
    }

    let sign = 1n;
    let digits = trimmed;

    if (digits.startsWith("-"))
    {
      sign = -1n;
      digits = digits.slice(1);
    }
    else if (digits.startsWith("+"))
    {
      digits = digits.slice(1);
    }

    if (!digits.length)
    {
      throw new Error("No digits");
    }

    const bigBase = BigInt(base);
    let result = 0n;

    for (const character of digits.toLowerCase())
    {
      let digitValue;
      if (character >= "0" && character <= "9")
      {
        digitValue = BigInt(character.charCodeAt(0) - 48);
      }
      else if (character >= "a" && character <= "z")
      {
        digitValue = BigInt(character.charCodeAt(0) - 87);
      }
      else
      {
        throw new Error(`Incorrect character "${character}". Use digits 0-9 and letters A-Z only.`);
      }

      if (digitValue >= bigBase)
      {
        throw new Error(`Digit "${character}" is not correct for base ${base}. ${getBaseDigitHint(base)}`);
      }

      result = result * bigBase + digitValue;
    }

    return result * sign;
  }


  // Fetch JSON config files that describe categories and tools.
  async function loadJson(url)
  {
    const response = await fetch(url);
    if (!response.ok)
    {
      throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  function formatNumber(value)
  {
    if (!Number.isFinite(value))
    {
      return "--";
    }

    const absValue = Math.abs(value);
    if (absValue !== 0 && (absValue < 0.0001 || absValue >= 1000000))
    {
      return value.toExponential(4);
    }

    return numberFormatter.format(value);
  }

  function setOutputMessage(targetElement, message, state)
  {
    if (!targetElement)
    {
      return;
    }

    targetElement.textContent = message;

    if (state)
    {
      targetElement.dataset.state = state;
    }
    else
    {
      targetElement.removeAttribute("data-state");
    }
  }

  function populateSelectOptions(selectElement, options)
  {
    if (!selectElement)
    {
      return;
    }

    selectElement.innerHTML = "";
    options.forEach((optionData) =>
    {
      const option = document.createElement("option");
      option.value = optionData.id;
      option.textContent = optionData.label;
      selectElement.appendChild(option);
    });
  }

  function buildIdMap(items)
  {
    const map = {};
    items.forEach((item) =>
    {
      map[item.id] = item;
    });
    return map;
  }

  function createLabel(forId, labelText)
  {
    const label = document.createElement("label");
    label.className = "form-label";
    label.setAttribute("for", forId);
    label.textContent = labelText;
    return label;
  }

  function createInputField({ id, label, placeholder, type, inputMode, dataset })
  {
    const fieldWrapper = document.createElement("div");
    fieldWrapper.className = "tool-field";

    const labelElement = createLabel(id, label);
    const inputElement = document.createElement("input");

    inputElement.id = id;
    inputElement.className = "form-control";
    inputElement.type = type || "number";
    if (inputElement.type === "number")
    {
      inputElement.step = "any";
      inputElement.setAttribute("inputmode", inputMode || "decimal");
    }
    else if (inputMode)
    {
      inputElement.setAttribute("inputmode", inputMode);
    }

    if (placeholder)
    {
      inputElement.placeholder = placeholder;
    }

    if (dataset)
    {
      Object.entries(dataset).forEach(([key, value]) =>
      {
        inputElement.dataset[key] = value;
      });
    }

    fieldWrapper.append(labelElement, inputElement);
    return { field: fieldWrapper, input: inputElement };
  }

  function createSelectField({ id, label, dataset })
  {
    const fieldWrapper = document.createElement("div");
    fieldWrapper.className = "tool-field tool-field--select";

    const labelElement = createLabel(id, label);
    const selectElement = document.createElement("select");

    selectElement.id = id;
    selectElement.className = "form-select tool-select";

    if (dataset)
    {
      Object.entries(dataset).forEach(([key, value]) =>
      {
        selectElement.dataset[key] = value;
      });
    }

    fieldWrapper.append(labelElement, selectElement);
    return { field: fieldWrapper, select: selectElement };
  }

  function createTextareaField({ id, label, placeholder, rows, dataset })
  {
    const fieldWrapper = document.createElement("div");
    fieldWrapper.className = "tool-field";

    const labelElement = createLabel(id, label);
    const textareaElement = document.createElement("textarea");

    textareaElement.id = id;
    textareaElement.className = "form-control";
    textareaElement.rows = rows || 4;

    if (placeholder)
    {
      textareaElement.placeholder = placeholder;
    }

    if (dataset)
    {
      Object.entries(dataset).forEach(([key, value]) =>
      {
        textareaElement.dataset[key] = value;
      });
    }

    fieldWrapper.append(labelElement, textareaElement);
    return { field: fieldWrapper, textarea: textareaElement };
  }

  function createOutputMessage(message, asPreformatted)
  {
    const output = document.createElement("div");
    output.className = asPreformatted ? "tool-output tool-output--pre" : "tool-output";
    output.dataset.output = "true";
    output.setAttribute("role", "status");
    output.setAttribute("aria-live", "polite");
    output.textContent = message;
    return output;
  }

  function createNoteElement(text)
  {
    if (!text)
    {
      return null;
    }

    const note = document.createElement("p");
    note.className = "tool-note";
    note.textContent = text;
    return note;
  }

  // Build a tool card from JSON definition and register it for wiring.
  function createToolCard(toolDefinition)
  {
    const toolCard = document.createElement("article");
    toolCard.className = "tool-card";

    if (toolDefinition.type)
    {
      toolCard.dataset.tool = toolDefinition.type;
    }

    const titleElement = document.createElement("h3");
    titleElement.textContent = toolDefinition.title || "Tool";
    toolCard.appendChild(titleElement);

    const helperText = toolDefinition.note || toolDefinition.description;
    const helperNote = createNoteElement(helperText);

    if (toolDefinition.type === "unit-converter")
    {
      const inputGrid = document.createElement("div");
      inputGrid.className = "tool-grid";

      const valueId = `${toolDefinition.id}-value`;
      const fromId = `${toolDefinition.id}-from`;
      const toId = `${toolDefinition.id}-to`;

      const { field: valueField } = createInputField({
        id: valueId,
        label: toolDefinition.valueLabel || "Value",
        placeholder: toolDefinition.placeholder,
        inputMode: "decimal",
        dataset: { value: "true" }
      });

      const { field: fromField } = createSelectField({
        id: fromId,
        label: toolDefinition.fromLabel || "From",
        dataset: { unit: "from" }
      });

      const { field: toField } = createSelectField({
        id: toId,
        label: toolDefinition.toLabel || "To",
        dataset: { unit: "to" }
      });

      inputGrid.append(valueField, fromField, toField);
      toolCard.appendChild(inputGrid);

      if (helperNote)
      {
        toolCard.appendChild(helperNote);
      }

      toolCard.appendChild(createOutputMessage(toolDefinition.emptyMessage || "Result appears here after you type a value."));
    }
    else if (toolDefinition.type === "temperature-converter")
    {
      const inputGrid = document.createElement("div");
      inputGrid.className = "tool-grid";

      const valueId = `${toolDefinition.id}-value`;
      const fromId = `${toolDefinition.id}-from`;
      const toId = `${toolDefinition.id}-to`;

      const { field: valueField } = createInputField({
        id: valueId,
        label: toolDefinition.valueLabel || "Value",
        placeholder: toolDefinition.placeholder,
        inputMode: "decimal",
        dataset: { value: "true" }
      });

      const { field: fromField } = createSelectField({
        id: fromId,
        label: toolDefinition.fromLabel || "From",
        dataset: { scale: "from" }
      });

      const { field: toField } = createSelectField({
        id: toId,
        label: toolDefinition.toLabel || "To",
        dataset: { scale: "to" }
      });

      inputGrid.append(valueField, fromField, toField);
      toolCard.appendChild(inputGrid);

      if (helperNote)
      {
        toolCard.appendChild(helperNote);
      }

      toolCard.appendChild(createOutputMessage(toolDefinition.emptyMessage || "Result appears here after you type a value."));
    }
    else if (toolDefinition.type === "base-converter")
    {
      const inputGrid = document.createElement("div");
      inputGrid.className = "tool-grid";

      const valueId = `${toolDefinition.id}-value`;
      const fromId = `${toolDefinition.id}-from`;
      const toId = `${toolDefinition.id}-to`;

      const { field: valueField } = createInputField({
        id: valueId,
        label: toolDefinition.valueLabel || "Value",
        placeholder: toolDefinition.placeholder,
        type: "text",
        inputMode: "text",
        dataset: { value: "true" }
      });

      const { field: fromField } = createSelectField({
        id: fromId,
        label: toolDefinition.fromLabel || "From",
        dataset: { base: "from" }
      });

      const { field: toField } = createSelectField({
        id: toId,
        label: toolDefinition.toLabel || "To",
        dataset: { base: "to" }
      });

      inputGrid.append(valueField, fromField, toField);
      toolCard.appendChild(inputGrid);

      if (helperNote)
      {
        toolCard.appendChild(helperNote);
      }

      toolCard.appendChild(createOutputMessage(toolDefinition.emptyMessage || "Result appears here after you type a value."));
    }
    else if (toolDefinition.type === "binary-text")
    {
      const inputGrid = document.createElement("div");
      inputGrid.className = "tool-grid";

      const modeId = `${toolDefinition.id}-mode`;
      const inputId = `${toolDefinition.id}-input`;
      const defaultPlaceholder = toolDefinition.placeholders ? toolDefinition.placeholders["text-to-binary"] : null;
      const textAreaRows = toolDefinition.textareaRows || toolDefinition.rows || 6;

      const { field: modeField } = createSelectField({
        id: modeId,
        label: toolDefinition.modeLabel || "Mode",
        dataset: { mode: "true" }
      });

      const { field: inputField } = createTextareaField({
        id: inputId,
        label: toolDefinition.inputLabel || "Input",
        placeholder: defaultPlaceholder || "Type text to convert",
        rows: textAreaRows,
        dataset: { input: "true" }
      });

      inputGrid.append(modeField, inputField);
      toolCard.appendChild(inputGrid);

      if (helperNote)
      {
        toolCard.appendChild(helperNote);
      }

      toolCard.appendChild(createOutputMessage(toolDefinition.emptyMessage || "Enter input to convert.", true));
    }
    else if (toolDefinition.type === "ohms-law" || toolDefinition.type === "circle")
    {
      if (helperNote)
      {
        toolCard.appendChild(helperNote);
      }

      const inputGrid = document.createElement("div");
      inputGrid.className = "tool-grid";

      const fieldDefinitions = Array.isArray(toolDefinition.fields) ? toolDefinition.fields : [];
      fieldDefinitions.forEach((fieldDefinition) =>
      {
        const fieldId = `${toolDefinition.id}-${fieldDefinition.key}`;
        const { field } = createInputField({
          id: fieldId,
          label: fieldDefinition.label,
          placeholder: fieldDefinition.placeholder,
          inputMode: fieldDefinition.inputMode || "decimal",
          dataset: { [fieldDefinition.key]: "true" }
        });
        inputGrid.appendChild(field);
      });

      toolCard.appendChild(inputGrid);

      const actionGroup = document.createElement("div");
      actionGroup.className = "tool-actions";

      const actionDefinitions = Array.isArray(toolDefinition.actions) ? toolDefinition.actions : [];
      actionDefinitions.forEach((actionDefinition) =>
      {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-sm btn-outline-light";
        button.dataset.action = actionDefinition.id;
        button.textContent = actionDefinition.label;
        actionGroup.appendChild(button);
      });

      toolCard.appendChild(actionGroup);
      toolCard.appendChild(createOutputMessage(toolDefinition.emptyMessage || "Enter values to solve."));
    }
    else
    {
      const fallback = document.createElement("p");
      fallback.className = "tool-note";
      fallback.textContent = "This tool is not configured yet.";
      toolCard.appendChild(fallback);
    }

    toolConfigMap.set(toolCard, toolDefinition);
    return toolCard;
  }

  function createConstantsCard(sectionDefinition)
  {
    const constantsCard = document.createElement("article");
    constantsCard.className = "tool-card";

    const titleElement = document.createElement("h3");
    titleElement.textContent = sectionDefinition.title || "Constants";
    constantsCard.appendChild(titleElement);

    if (sectionDefinition.description)
    {
      const description = createNoteElement(sectionDefinition.description);
      if (description)
      {
        constantsCard.appendChild(description);
      }
    }

    const constantList = document.createElement("dl");
    constantList.className = "tool-constants";

    const constantEntries = Array.isArray(sectionDefinition.constants) ? sectionDefinition.constants : [];
    constantEntries.forEach((constantItem) =>
    {
      const constantRow = document.createElement("div");
      constantRow.className = "tool-constant";

      const nameTerm = document.createElement("dt");
      nameTerm.textContent = constantItem.name;

      const valueDefinition = document.createElement("dd");
      valueDefinition.textContent = constantItem.value;

      constantRow.append(nameTerm, valueDefinition);
      constantList.appendChild(constantRow);
    });

    constantsCard.appendChild(constantList);

    if (sectionDefinition.note)
    {
      const noteElement = createNoteElement(sectionDefinition.note);
      if (noteElement)
      {
        constantsCard.appendChild(noteElement);
      }
    }

    return constantsCard;
  }

  function createErrorCard(errorMessage)
  {
    const card = document.createElement("article");
    card.className = "tool-card";

    const title = document.createElement("h3");
    title.textContent = "Unavailable";

    const note = document.createElement("p");
    note.className = "tool-note";
    note.textContent = errorMessage;

    card.append(title, note);
    return card;
  }

  function setupUnitConverter(toolCard)
  {
    const toolConfig = toolConfigMap.get(toolCard);
    if (!toolConfig || !Array.isArray(toolConfig.units))
    {
      return;
    }

    const valueInput = toolCard.querySelector("[data-value]");
    const fromSelect = toolCard.querySelector("[data-unit=\"from\"]");
    const toSelect = toolCard.querySelector("[data-unit=\"to\"]");
    const outputElement = toolCard.querySelector("[data-output]");

    if (!valueInput || !fromSelect || !toSelect || !outputElement)
    {
      return;
    }

    populateSelectOptions(fromSelect, toolConfig.units);
    populateSelectOptions(toSelect, toolConfig.units);

    if (toolConfig.defaultFrom)
    {
      fromSelect.value = toolConfig.defaultFrom;
    }

    if (toolConfig.defaultTo)
    {
      toSelect.value = toolConfig.defaultTo;
    }

    const unitLookup = buildIdMap(toolConfig.units);

    const updateConversion = () =>
    {
      const rawValue = parseFloat(valueInput.value);
      if (!Number.isFinite(rawValue))
      {
        setOutputMessage(outputElement, toolConfig.emptyMessage || "Result appears here after you type a value.");
        return;
      }

      const fromUnit = unitLookup[fromSelect.value];
      const toUnit = unitLookup[toSelect.value];

      if (!fromUnit || !toUnit)
      {
        setOutputMessage(outputElement, "Select both a From unit and a To unit to convert.", "error");
        return;
      }

      const baseValue = rawValue * fromUnit.factor;
      const result = baseValue / toUnit.factor;

      setOutputMessage(
        outputElement,
        `${formatNumber(rawValue)} ${fromUnit.short} = ${formatNumber(result)} ${toUnit.short}`
      );
    };

    valueInput.addEventListener("input", updateConversion);
    fromSelect.addEventListener("change", updateConversion);
    toSelect.addEventListener("change", updateConversion);
    updateConversion();
  }

  function toCelsius(value, scale)
  {
    if (scale === "c")
    {
      return value;
    }

    if (scale === "f")
    {
      return (value - 32) * 5 / 9;
    }

    if (scale === "k")
    {
      return value - 273.15;
    }

    return value;
  }

  function fromCelsius(value, scale)
  {
    if (scale === "c")
    {
      return value;
    }

    if (scale === "f")
    {
      return value * 9 / 5 + 32;
    }

    if (scale === "k")
    {
      return value + 273.15;
    }

    return value;
  }

  function setupTemperatureConverter(toolCard)
  {
    const toolConfig = toolConfigMap.get(toolCard);
    if (!toolConfig || !Array.isArray(toolConfig.scales))
    {
      return;
    }

    const valueInput = toolCard.querySelector("[data-value]");
    const fromSelect = toolCard.querySelector("[data-scale=\"from\"]");
    const toSelect = toolCard.querySelector("[data-scale=\"to\"]");
    const outputElement = toolCard.querySelector("[data-output]");

    if (!valueInput || !fromSelect || !toSelect || !outputElement)
    {
      return;
    }

    populateSelectOptions(fromSelect, toolConfig.scales);
    populateSelectOptions(toSelect, toolConfig.scales);

    fromSelect.value = toolConfig.defaultFrom || "c";
    toSelect.value = toolConfig.defaultTo || "f";

    const scaleLookup = buildIdMap(toolConfig.scales);

    const updateConversion = () =>
    {
      const rawValue = parseFloat(valueInput.value);
      if (!Number.isFinite(rawValue))
      {
        setOutputMessage(outputElement, toolConfig.emptyMessage || "Result appears here after you type a value.");
        return;
      }

      const fromScale = fromSelect.value;
      const toScale = toSelect.value;
      const minimumValue = getMinimumTemperature(fromScale);
      if (Number.isFinite(minimumValue) && rawValue < minimumValue)
      {
        const fromLabel = scaleLookup[fromScale] ? scaleLookup[fromScale].short : fromScale;
        setOutputMessage(
          outputElement,
          `Temperature must be at or above ${formatNumber(minimumValue)} ${fromLabel} (absolute zero).`,
          "error"
        );
        return;
      }

      const celsiusValue = toCelsius(rawValue, fromScale);
      const result = fromCelsius(celsiusValue, toScale);
      const fromLabel = scaleLookup[fromScale] ? scaleLookup[fromScale].short : fromScale;
      const toLabel = scaleLookup[toScale] ? scaleLookup[toScale].short : toScale;

      setOutputMessage(
        outputElement,
        `${formatNumber(rawValue)} ${fromLabel} = ${formatNumber(result)} ${toLabel}`
      );
    };

    valueInput.addEventListener("input", updateConversion);
    fromSelect.addEventListener("change", updateConversion);
    toSelect.addEventListener("change", updateConversion);
    updateConversion();
  }

  function setupBaseConverter(toolCard)
  {
    const toolConfig = toolConfigMap.get(toolCard);
    if (!toolConfig || !Array.isArray(toolConfig.bases))
    {
      return;
    }

    const valueInput = toolCard.querySelector("[data-value]");
    const fromSelect = toolCard.querySelector("[data-base=\"from\"]");
    const toSelect = toolCard.querySelector("[data-base=\"to\"]");
    const outputElement = toolCard.querySelector("[data-output]");

    if (!valueInput || !fromSelect || !toSelect || !outputElement)
    {
      return;
    }

    populateSelectOptions(fromSelect, toolConfig.bases);
    populateSelectOptions(toSelect, toolConfig.bases);

    fromSelect.value = toolConfig.defaultFrom || "2";
    toSelect.value = toolConfig.defaultTo || "16";

    const updateConversion = () =>
    {
      const rawValue = valueInput.value.trim();
      if (!rawValue)
      {
        setOutputMessage(outputElement, toolConfig.emptyMessage || "Result appears here after you type a value.");
        return;
      }

      const cleaned = rawValue.replace(/\s+/g, "");
      const fromBase = Number.parseInt(fromSelect.value, 10);
      const toBase = Number.parseInt(toSelect.value, 10);
      const validator = baseDigitValidators[fromBase];

      if (!validator)
      {
        setOutputMessage(
          outputElement,
          `Unsupported base ${fromBase}. Supported bases: ${supportedBases.join(", ")}.`,
          "error"
        );
        return;
      }

      if (!validator.test(cleaned))
      {
        setOutputMessage(outputElement, getBaseDigitHint(fromBase), "error");
        return;
      }

      let parsed;
      try
      {
        parsed = parseBigIntFromBase(cleaned, fromBase);
      }
      catch (error)
      {
        setOutputMessage(
          outputElement,
          "Unable to parse that value. Use digits allowed for the selected base (optional leading + or -).",
          "error"
        );
        return;
      }

      const converted = parsed.toString(toBase).toUpperCase();
      setOutputMessage(
        outputElement,
        `${cleaned.toUpperCase()} (base ${fromBase}) = ${converted} (base ${toBase})`
      );
    };

    valueInput.addEventListener("input", updateConversion);
    fromSelect.addEventListener("change", updateConversion);
    toSelect.addEventListener("change", updateConversion);
    updateConversion();
  }

  function setupBinaryTextConverter(toolCard)
  {
    const toolConfig = toolConfigMap.get(toolCard);
    const modeSelect = toolCard.querySelector("[data-mode]");
    const inputField = toolCard.querySelector("[data-input]");
    const outputElement = toolCard.querySelector("[data-output]");

    if (!modeSelect || !inputField || !outputElement)
    {
      return;
    }

    const textEncoder = "TextEncoder" in window ? new TextEncoder() : null;
    const textDecoder = "TextDecoder" in window ? new TextDecoder() : null;

    const modePlaceholders = toolConfig && toolConfig.placeholders ? toolConfig.placeholders : {};
    const modeOptions = toolConfig && Array.isArray(toolConfig.modes) ? toolConfig.modes : [];

    if (modeOptions.length)
    {
      populateSelectOptions(modeSelect, modeOptions);
      modeSelect.value = modeOptions[0].id;
    }

    const updateInputPlaceholder = () =>
    {
      const placeholder = modePlaceholders[modeSelect.value];
      if (placeholder)
      {
        inputField.placeholder = placeholder;
      }
    };

    const updateConversion = () =>
    {
      if (!textEncoder || !textDecoder)
      {
        setOutputMessage(outputElement, "Text encoding is not supported in this browser.", "error");
        return;
      }

      if (modeSelect.value === "text-to-binary")
      {
        if (!inputField.value)
        {
          setOutputMessage(outputElement, toolConfig && toolConfig.emptyMessage ? toolConfig.emptyMessage : "Enter text to convert.");
          return;
        }

        const bytes = textEncoder.encode(inputField.value);
        const binary = Array.from(bytes)
          .map((byte) => byte.toString(2).padStart(8, "0"))
          .join(" ");

        setOutputMessage(outputElement, binary || "(empty)");
        return;
      }

      const rawBinary = inputField.value.trim();
      if (!rawBinary)
      {
        setOutputMessage(outputElement, toolConfig && toolConfig.emptyMessage ? toolConfig.emptyMessage : "Enter binary to convert.");
        return;
      }

      if (!/^[01\s]+$/.test(rawBinary))
      {
        setOutputMessage(
          outputElement,
          "Binary input can only include 0 and 1 (spaces are allowed between 8-bit groups).",
          "error"
        );
        return;
      }

      const cleaned = rawBinary.replace(/\s+/g, "");
      if (cleaned.length % 8 !== 0)
      {
        setOutputMessage(
          outputElement,
          "Binary input must be in 8-bit groups (e.g., 01001000 01101001).",
          "error"
        );
        return;
      }

      const bytes = new Uint8Array(cleaned.length / 8);
      for (let i = 0; i < bytes.length; i += 1)
      {
        const byte = cleaned.slice(i * 8, i * 8 + 8);
        bytes[i] = Number.parseInt(byte, 2);
      }

      setOutputMessage(outputElement, textDecoder.decode(bytes) || "(empty)");
    };

    modeSelect.addEventListener("change", () =>
    {
      updateInputPlaceholder();
      updateConversion();
    });

    inputField.addEventListener("input", updateConversion);
    updateInputPlaceholder();
    updateConversion();
  }

  function setupOhmsLaw(toolCard)
  {
    const toolConfig = toolConfigMap.get(toolCard);
    const voltageInput = toolCard.querySelector("[data-voltage]");
    const currentInput = toolCard.querySelector("[data-current]");
    const resistanceInput = toolCard.querySelector("[data-resistance]");
    const solveButton = toolCard.querySelector("[data-action=\"solve\"]");
    const clearButton = toolCard.querySelector("[data-action=\"clear\"]");
    const outputElement = toolCard.querySelector("[data-output]");

    if (!voltageInput || !currentInput || !resistanceInput || !solveButton || !clearButton || !outputElement)
    {
      return;
    }

    const clearInputs = () =>
    {
      voltageInput.value = "";
      currentInput.value = "";
      resistanceInput.value = "";
      setOutputMessage(outputElement, toolConfig && toolConfig.emptyMessage ? toolConfig.emptyMessage : "Enter any two values to solve.");
    };

    const solveEquation = () =>
    {
      const voltageValue = Number.parseFloat(voltageInput.value);
      const currentValue = Number.parseFloat(currentInput.value);
      const resistanceValue = Number.parseFloat(resistanceInput.value);

      const hasVoltage = Number.isFinite(voltageValue);
      const hasCurrent = Number.isFinite(currentValue);
      const hasResistance = Number.isFinite(resistanceValue);
      const providedCount = [hasVoltage, hasCurrent, hasResistance].filter(Boolean).length;

      if (providedCount < 2)
      {
        setOutputMessage(
          outputElement,
          "Provide any two numeric values to solve for the third.",
          "error"
        );
        return;
      }

      let solvedVoltage = voltageValue;
      let solvedCurrent = currentValue;
      let solvedResistance = resistanceValue;

      if (!hasVoltage)
      {
        solvedVoltage = solvedCurrent * solvedResistance;
        voltageInput.value = formatNumber(solvedVoltage);
      }
      else if (!hasCurrent)
      {
        if (solvedResistance === 0)
        {
          setOutputMessage(outputElement, "Resistance must be non-zero to solve for current.", "error");
          return;
        }
        solvedCurrent = solvedVoltage / solvedResistance;
        currentInput.value = formatNumber(solvedCurrent);
      }
      else if (!hasResistance)
      {
        if (solvedCurrent === 0)
        {
          setOutputMessage(outputElement, "Current must be non-zero to solve for resistance.", "error");
          return;
        }
        solvedResistance = solvedVoltage / solvedCurrent;
        resistanceInput.value = formatNumber(solvedResistance);
      }

      setOutputMessage(
        outputElement,
        `V = ${formatNumber(solvedVoltage)} V, I = ${formatNumber(solvedCurrent)} A, R = ${formatNumber(solvedResistance)} ohm.`
      );
    };

    solveButton.addEventListener("click", solveEquation);
    clearButton.addEventListener("click", clearInputs);
  }

  function setupCircleCalculator(toolCard)
  {
    const toolConfig = toolConfigMap.get(toolCard);
    const radiusInput = toolCard.querySelector("[data-radius]");
    const solveButton = toolCard.querySelector("[data-action=\"solve\"]");
    const clearButton = toolCard.querySelector("[data-action=\"clear\"]");
    const outputElement = toolCard.querySelector("[data-output]");

    if (!radiusInput || !solveButton || !clearButton || !outputElement)
    {
      return;
    }

    const clearInputs = () =>
    {
      radiusInput.value = "";
      setOutputMessage(outputElement, toolConfig && toolConfig.emptyMessage ? toolConfig.emptyMessage : "Enter a radius to calculate.");
    };

    const solveCircle = () =>
    {
      const radiusValue = Number.parseFloat(radiusInput.value);
      if (!Number.isFinite(radiusValue))
      {
        setOutputMessage(outputElement, "Enter a numeric radius (0 or greater).", "error");
        return;
      }

      if (radiusValue < 0)
      {
        setOutputMessage(outputElement, "Radius must be 0 or greater (no negative values).", "error");
        return;
      }

      const areaValue = Math.PI * radiusValue * radiusValue;
      const circumferenceValue = 2 * Math.PI * radiusValue;

      setOutputMessage(
        outputElement,
        `Area = ${formatNumber(areaValue)} (units^2), Circumference = ${formatNumber(circumferenceValue)} (units)`
      );
    };

    solveButton.addEventListener("click", solveCircle);
    clearButton.addEventListener("click", clearInputs);
  }

  function initToolInteractions()
  {
    document
      .querySelectorAll("[data-tool=\"unit-converter\"]")
      .forEach(setupUnitConverter);

    document
      .querySelectorAll("[data-tool=\"temperature-converter\"]")
      .forEach(setupTemperatureConverter);

    document
      .querySelectorAll("[data-tool=\"base-converter\"]")
      .forEach(setupBaseConverter);

    document
      .querySelectorAll("[data-tool=\"binary-text\"]")
      .forEach(setupBinaryTextConverter);

    document
      .querySelectorAll("[data-tool=\"ohms-law\"]")
      .forEach(setupOhmsLaw);

    document
      .querySelectorAll("[data-tool=\"circle\"]")
      .forEach(setupCircleCalculator);
  }

  function initCategoryDeepLinks()
  {
    const openCategoryFromHash = (hash) =>
    {
      if (!hash)
      {
        return;
      }

      const targetId = hash.replace("#", "");
      if (!targetId)
      {
        return;
      }

      const targetSection = document.getElementById(targetId);
      if (targetSection && targetSection.tagName.toLowerCase() === "details")
      {
        targetSection.open = true;
        targetSection.querySelector(".toolkit-section-summary")?.scrollIntoView({ block: "start" });
      }
    };

    window.addEventListener("hashchange", () =>
    {
      openCategoryFromHash(window.location.hash);
    });

    openCategoryFromHash(window.location.hash);
  }

  // Render categories, then wire all tool handlers once the cards exist.
  async function initToolkits()
  {
    const contentContainer = document.querySelector("[data-toolkit-content]");
    const statusMessage = document.querySelector("[data-toolkit-status]");

    if (!contentContainer)
    {
      return;
    }

    try
    {
      if (statusMessage)
      {
        statusMessage.textContent = "Loading toolkits...";
      }

      const toolkitConfig = await loadJson(TOOLKIT_CONFIG_URL);
      const categoryList = toolkitConfig && Array.isArray(toolkitConfig.categories) ? toolkitConfig.categories : [];

      if (categoryList.length === 0)
      {
        throw new Error("No toolkit categories configured.");
      }

      if (statusMessage)
      {
        statusMessage.remove();
      }
      contentContainer.innerHTML = "";

      for (const categoryDefinition of categoryList)
      {
        const categorySection = document.createElement("details");
        categorySection.id = categoryDefinition.id;
        categorySection.className = "toolkit-section";

        const sectionSummary = document.createElement("summary");
        sectionSummary.className = "toolkit-section-summary";

        const summaryText = document.createElement("div");
        summaryText.className = "toolkit-summary-text";

        const summaryTitle = document.createElement("h2");
        summaryTitle.className = "toolkit-summary-title";
        summaryTitle.textContent = categoryDefinition.title;
        summaryText.appendChild(summaryTitle);

        const subtitleText = categoryDefinition.subtitle || categoryDefinition.description;
        if (subtitleText)
        {
          const summarySubtitle = document.createElement("p");
          summarySubtitle.className = "toolkit-summary-subtitle";
          summarySubtitle.textContent = subtitleText;
          summaryText.appendChild(summarySubtitle);
        }

        const summaryIcon = document.createElement("span");
        summaryIcon.className = "toolkit-summary-icon";
        summaryIcon.setAttribute("aria-hidden", "true");
        summaryIcon.textContent = "▼";

        sectionSummary.append(summaryText, summaryIcon);
        categorySection.appendChild(sectionSummary);

        const sectionBody = document.createElement("div");
        sectionBody.className = "toolkit-section-body";

        const toolGrid = document.createElement("div");
        toolGrid.className = "toolkit-card-grid";

        try
        {
          const categoryData = await loadJson(categoryDefinition.dataUrl);

          if (categoryDefinition.layout === "constants" && Array.isArray(categoryData.sections))
          {
            categoryData.sections.forEach((constantsSection) =>
            {
              toolGrid.appendChild(createConstantsCard(constantsSection));
            });
          }
          else if (Array.isArray(categoryData.tools))
          {
            categoryData.tools.forEach((toolDefinition) =>
            {
              toolGrid.appendChild(createToolCard(toolDefinition));
            });
          }
          else
          {
            toolGrid.appendChild(createErrorCard("No tools found for this category."));
          }
        }
        catch (error)
        {
          console.error(error);
          toolGrid.appendChild(createErrorCard("Unable to load this category."));
        }

        const sectionFooter = document.createElement("div");
        sectionFooter.className = "toolkit-section-footer";

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "btn btn-sm btn-outline-light";
        closeButton.textContent = `Hide ${categoryDefinition.title} category`;
        closeButton.addEventListener("click", () =>
        {
          categorySection.open = false;
          sectionSummary.focus();
        });

        sectionFooter.appendChild(closeButton);

        sectionBody.appendChild(toolGrid);
        sectionBody.appendChild(sectionFooter);
        categorySection.appendChild(sectionBody);
        contentContainer.appendChild(categorySection);
      }

      initToolInteractions();
      initCategoryDeepLinks();
    }
    catch (error)
    {
      console.error(error);
      if (statusMessage)
      {
        statusMessage.textContent = "Unable to load toolkits. Please refresh the page.";
      }
    }
  }

  if (document.readyState === "loading")
  {
    document.addEventListener("DOMContentLoaded", initToolkits, { once: true });
  }
  else
  {
    initToolkits();
  }
})();
