(() =>
{
  const _quizConfig = {
    categoriesUrl: "/quizzes/data/categories.json",
    defaultQuestionCount: 10,
    shuffleChoices: true
  };

  const _svgNamespace = "http://www.w3.org/2000/svg";
  const _slicePalette = [
    {
      base: "rgba(56, 189, 248, 0.44)",
      hover: "rgba(56, 189, 248, 0.7)",
      active: "rgba(56, 189, 248, 0.9)",
      glow: "rgba(56, 189, 248, 0.55)",
      glowStrong: "rgba(56, 189, 248, 0.9)",
      stroke: "rgba(56, 189, 248, 0.8)",
      strokeStrong: "rgba(56, 189, 248, 1)"
    },
    {
      base: "rgba(34, 197, 94, 0.44)",
      hover: "rgba(34, 197, 94, 0.7)",
      active: "rgba(34, 197, 94, 0.9)",
      glow: "rgba(34, 197, 94, 0.55)",
      glowStrong: "rgba(34, 197, 94, 0.9)",
      stroke: "rgba(34, 197, 94, 0.8)",
      strokeStrong: "rgba(34, 197, 94, 1)"
    },
    {
      base: "rgba(251, 191, 36, 0.44)",
      hover: "rgba(251, 191, 36, 0.7)",
      active: "rgba(251, 191, 36, 0.9)",
      glow: "rgba(251, 191, 36, 0.55)",
      glowStrong: "rgba(251, 191, 36, 0.9)",
      stroke: "rgba(251, 191, 36, 0.8)",
      strokeStrong: "rgba(251, 191, 36, 1)"
    },
    {
      base: "rgba(14, 116, 144, 0.44)",
      hover: "rgba(14, 116, 144, 0.7)",
      active: "rgba(14, 116, 144, 0.9)",
      glow: "rgba(14, 116, 144, 0.55)",
      glowStrong: "rgba(14, 116, 144, 0.9)",
      stroke: "rgba(14, 116, 144, 0.8)",
      strokeStrong: "rgba(14, 116, 144, 1)"
    },
    {
      base: "rgba(248, 113, 113, 0.44)",
      hover: "rgba(248, 113, 113, 0.7)",
      active: "rgba(248, 113, 113, 0.9)",
      glow: "rgba(248, 113, 113, 0.55)",
      glowStrong: "rgba(248, 113, 113, 0.9)",
      stroke: "rgba(248, 113, 113, 0.8)",
      strokeStrong: "rgba(248, 113, 113, 1)"
    },
    {
      base: "rgba(59, 130, 246, 0.44)",
      hover: "rgba(59, 130, 246, 0.7)",
      active: "rgba(59, 130, 246, 0.9)",
      glow: "rgba(59, 130, 246, 0.55)",
      glowStrong: "rgba(59, 130, 246, 0.9)",
      stroke: "rgba(59, 130, 246, 0.8)",
      strokeStrong: "rgba(59, 130, 246, 1)"
    },
    {
      base: "rgba(16, 185, 129, 0.44)",
      hover: "rgba(16, 185, 129, 0.7)",
      active: "rgba(16, 185, 129, 0.9)",
      glow: "rgba(16, 185, 129, 0.55)",
      glowStrong: "rgba(16, 185, 129, 0.9)",
      stroke: "rgba(16, 185, 129, 0.8)",
      strokeStrong: "rgba(16, 185, 129, 1)"
    },
    {
      base: "rgba(236, 72, 153, 0.44)",
      hover: "rgba(236, 72, 153, 0.7)",
      active: "rgba(236, 72, 153, 0.9)",
      glow: "rgba(236, 72, 153, 0.55)",
      glowStrong: "rgba(236, 72, 153, 0.9)",
      stroke: "rgba(236, 72, 153, 0.8)",
      strokeStrong: "rgba(236, 72, 153, 1)"
    }
  ];

  const _categoryDataCache = new Map();
  const _categoryCardMap = new Map();
  const _categoryColorMap = new Map();
  const _preloadedImages = new Set();
  const _elements = {
    main: null,
    page: null,
    categoryContainer: null,
    categoryDetail: null,
    categoryTitle: null,
    categoryPreview: null,
    wheel: null,
    quizContainer: null
  };

  const _state = {
    categories: [],
    activeCategory: null,
    questions: [],
    questionIndex: 0,
    score: 0,
    answers: [],
    availableQuestionCount: 0
  };

  async function loadJson(_url)
  {
    const _response = await fetch(_url);
    if (!_response.ok)
    {
      throw new Error(`Failed to load ${_url}: ${_response.status} ${_response.statusText}`);
    }
    return _response.json();
  }

  function isLightTheme()
  {
    return document.documentElement.getAttribute("data-theme") === "light";
  }

  function getQuestionCount(_category)
  {
    const _rawCount = Number.parseInt(_category.questionCount, 10);
    if (Number.isFinite(_rawCount) && _rawCount > 0)
    {
      return _rawCount;
    }
    return _quizConfig.defaultQuestionCount;
  }

  function shuffleArray(_items)
  {
    const _shuffled = [..._items];
    for (let _index = _shuffled.length - 1; _index > 0; _index -= 1)
    {
      const _swapIndex = Math.floor(Math.random() * (_index + 1));
      const _temp = _shuffled[_index];
      _shuffled[_index] = _shuffled[_swapIndex];
      _shuffled[_swapIndex] = _temp;
    }
    return _shuffled;
  }

  function selectRandomQuestions(_questions, _count)
  {
    if (!Array.isArray(_questions) || _questions.length === 0)
    {
      return [];
    }
    const _safeCount = Math.min(_count, _questions.length);
    return shuffleArray(_questions).slice(0, _safeCount);
  }

  function shuffleQuestionChoices(_question)
  {
    if (!_question || !Array.isArray(_question.choices) || _question.choices.length < 2)
    {
      return _question;
    }

    const _correctIndex = Number.isInteger(_question.correctIndex) ? _question.correctIndex : -1;
    if (_correctIndex < 0 || _correctIndex >= _question.choices.length)
    {
      return _question;
    }

    const _choices = _question.choices.map((_choice, _index) => ({
      value: _choice,
      index: _index
    }));

    const _shuffled = shuffleArray(_choices);
    const _newCorrectIndex = _shuffled.findIndex((_item) => _item.index === _correctIndex);

    return {
      ..._question,
      choices: _shuffled.map((_item) => _item.value),
      correctIndex: _newCorrectIndex
    };
  }

  function getSliceColors(_index)
  {
    return _slicePalette[_index % _slicePalette.length];
  }

  function resolveSliceColors(_category, _index)
  {
    const _baseColors = getSliceColors(_index);

    if (!_category || !_category.colors)
    {
      return _baseColors;
    }

    const _customColors = _category.colors;
    return {
      base: _customColors.base || _baseColors.base,
      hover: _customColors.hover || _baseColors.hover,
      active: _customColors.active || _baseColors.active,
      glow: _customColors.glow || _baseColors.glow,
      glowStrong: _customColors.glowStrong || _baseColors.glowStrong,
      stroke: _customColors.stroke || _baseColors.stroke,
      strokeStrong: _customColors.strokeStrong || _baseColors.strokeStrong
    };
  }

  function polarToCartesian(_centerX, _centerY, _radius, _angleDegrees)
  {
    const _angleRadians = (Math.PI / 180) * (_angleDegrees - 90);
    return {
      x: _centerX + _radius * Math.cos(_angleRadians),
      y: _centerY + _radius * Math.sin(_angleRadians)
    };
  }

  function createSlicePath(_centerX, _centerY, _radius, _startAngle, _endAngle)
  {
    const _start = polarToCartesian(_centerX, _centerY, _radius, _startAngle);
    const _end = polarToCartesian(_centerX, _centerY, _radius, _endAngle);
    const _largeArcFlag = _endAngle - _startAngle <= 180 ? "0" : "1";

    return [
      "M", _centerX, _centerY,
      "L", _start.x, _start.y,
      "A", _radius, _radius, 0, _largeArcFlag, 1, _end.x, _end.y,
      "Z"
    ].join(" ");
  }

  function splitSliceLabel(_label)
  {
    if (!_label || !_label.includes(" "))
    {
      if (_label && _label.length > 12)
      {
        const _splitIndex = Math.ceil(_label.length / 2);
        return [_label.slice(0, _splitIndex), _label.slice(_splitIndex)];
      }
      return [_label];
    }

    const _trimmed = _label.trim();
    if (_trimmed.length <= 14)
    {
      return [_trimmed];
    }

    const _words = _trimmed.split(" ");
    if (_words.length <= 1)
    {
      return [_trimmed];
    }

    const _lines = [];
    let _currentLine = "";

    _words.forEach((_word) =>
    {
      const _candidate = _currentLine ? `${_currentLine} ${_word}` : _word;
      if (_candidate.length <= 12)
      {
        _currentLine = _candidate;
      }
      else
      {
        if (_currentLine)
        {
          _lines.push(_currentLine);
        }
        _currentLine = _word;
      }
    });

    if (_currentLine)
    {
      _lines.push(_currentLine);
    }

    return _lines.slice(0, 3);
  }

  function getSliceFontSize(_label, _sliceCount)
  {
    const _baseSize = _sliceCount >= 9 ? 9 : _sliceCount >= 7 ? 9.5 : 10.5;
    const _labelLength = _label ? _label.length : 0;

    if (_labelLength > 18)
    {
      return _baseSize - 3;
    }

    if (_labelLength > 14)
    {
      return _baseSize - 2.5;
    }

    if (_labelLength > 10)
    {
      return _baseSize - 1.5;
    }

    return _baseSize;
  }

  function getWheelMetrics(_sliceCount)
  {
    const _size = 200;
    const _center = _size / 2;
    const _radius = 92;
    let _labelRatio = 0.54;

    if (_sliceCount >= 9)
    {
      _labelRatio = 0.48;
    }
    else if (_sliceCount >= 7)
    {
      _labelRatio = 0.52;
    }

    applyWheelDensity(_sliceCount);

    return {
      center: _center,
      radius: _radius,
      labelRadius: _radius * _labelRatio
    };
  }

  function renderCategoryStatus(_message, _stateValue)
  {
    if (!_elements.categoryDetail)
    {
      return;
    }

    _elements.categoryDetail.innerHTML = "";
    const _status = document.createElement("p");
    _status.className = "quiz-status";
    _status.setAttribute("role", "status");
    _status.setAttribute("aria-live", "polite");
    _status.textContent = _message;

    if (_stateValue)
    {
      _status.dataset.state = _stateValue;
    }

    _elements.categoryDetail.appendChild(_status);
  }

  function setQuizState(_stateValue)
  {
    if (!_elements.page)
    {
      return;
    }

    if (_stateValue)
    {
      _elements.page.dataset.quizState = _stateValue;
      if (_elements.main)
      {
        _elements.main.dataset.quizState = _stateValue;
      }
    }
    else
    {
      _elements.page.removeAttribute("data-quiz-state");
      if (_elements.main)
      {
        _elements.main.removeAttribute("data-quiz-state");
      }
    }
  }

  function returnToWheel()
  {
    clearActiveCategoryCard();
    clearCategoryAccent();
    updateCategoryTitle(null);
    _state.activeCategory = null;
    _state.questions = [];
    _state.questionIndex = 0;
    _state.score = 0;
    _state.answers = [];
    _state.availableQuestionCount = 0;

    if (_elements.quizContainer)
    {
      _elements.quizContainer.innerHTML = "";
    }

    renderCategoryDetail(null);
    setQuizState("idle");
    updateCategoryPreview(null);
  }

  function setQuizMessage(_message, _stateValue)
  {
    if (!_elements.quizContainer)
    {
      return;
    }

    _elements.quizContainer.innerHTML = "";
    const _status = document.createElement("p");
    _status.className = "quiz-status";
    _status.setAttribute("role", "status");
    _status.setAttribute("aria-live", "polite");
    _status.textContent = _message;

    if (_stateValue)
    {
      _status.dataset.state = _stateValue;
    }

    _elements.quizContainer.appendChild(_status);
  }

  function populateCategoryLabel(_target, _category, _includeBackIcon)
  {
    if (!_target)
    {
      return false;
    }

    _target.innerHTML = "";

    if (!_category || !_category.title)
    {
      return false;
    }

    if (_includeBackIcon)
    {
      const _backIcon = document.createElementNS(_svgNamespace, "svg");
      _backIcon.classList.add("quiz-back-icon");
      _backIcon.setAttribute("viewBox", "0 0 24 24");
      _backIcon.setAttribute("aria-hidden", "true");

      const _backPath = document.createElementNS(_svgNamespace, "path");
      _backPath.setAttribute("d", "M15 6l-6 6 6 6");
      _backPath.setAttribute("fill", "none");
      _backPath.setAttribute("stroke", "currentColor");
      _backPath.setAttribute("stroke-width", "2");
      _backPath.setAttribute("stroke-linecap", "round");
      _backPath.setAttribute("stroke-linejoin", "round");
      _backIcon.appendChild(_backPath);
      _target.appendChild(_backIcon);
    }

    if (_category.icon)
    {
      const _icon = document.createElement("img");
      _icon.className = "quiz-category-link-icon";
      _icon.src = _category.icon;
      _icon.alt = "";
      _icon.setAttribute("aria-hidden", "true");
      _icon.loading = "lazy";
      _icon.decoding = "async";
      _target.appendChild(_icon);
    }

    const _text = document.createElement("span");
    _text.className = "quiz-category-link-text";
    _text.textContent = _category.title;
    _target.appendChild(_text);
    return true;
  }

  function updateCategoryTitle(_category)
  {
    if (!_elements.categoryTitle)
    {
      return;
    }

    const _hasContent = populateCategoryLabel(_elements.categoryTitle, _category, true);
    if (_hasContent)
    {
      _elements.categoryTitle.setAttribute("aria-label", `Back to categories from ${_category.title}`);
      _elements.categoryTitle.hidden = false;
      return;
    }

    _elements.categoryTitle.textContent = "";
    _elements.categoryTitle.removeAttribute("aria-label");
    _elements.categoryTitle.hidden = true;
  }

  function updateCategoryPreview(_category)
  {
    if (!_elements.categoryPreview)
    {
      return;
    }

    if (!_elements.page || _elements.page.dataset.quizState !== "idle")
    {
      _elements.categoryPreview.dataset.previewVisible = "false";
      _elements.categoryPreview.setAttribute("aria-hidden", "true");
      _elements.categoryPreview.innerHTML = "";
      return;
    }

    const _hasContent = populateCategoryLabel(_elements.categoryPreview, _category, false);
    _elements.categoryPreview.dataset.previewVisible = _hasContent ? "true" : "false";
    _elements.categoryPreview.setAttribute("aria-hidden", _hasContent ? "false" : "true");

    if (!_hasContent)
    {
      _elements.categoryPreview.innerHTML = "";
    }
  }

  function setActiveCategoryCard(_categoryId)
  {
    _categoryCardMap.forEach((_card, _cardId) =>
    {
      if (_categoryId && _cardId === _categoryId)
      {
        _card.setAttribute("aria-pressed", "true");
      }
      else
      {
        _card.setAttribute("aria-pressed", "false");
      }
    });
  }

  function clearActiveCategoryCard()
  {
    _categoryCardMap.forEach((_card) =>
    {
      _card.setAttribute("aria-pressed", "false");
    });
  }

  function applyCategoryAccent(_categoryId)
  {
    const _target = _elements.main || _elements.page;
    if (!_target)
    {
      return;
    }

    if (isLightTheme())
    {
      clearCategoryAccent();
      return;
    }

    if (!_categoryId || !_categoryColorMap.has(_categoryId))
    {
      clearCategoryAccent();
      return;
    }

    const _colors = _categoryColorMap.get(_categoryId);
    _target.style.setProperty("--quiz-accent", _colors.hover || _colors.base);
    _target.style.setProperty("--quiz-accent-strong", _colors.active || _colors.hover);
    _target.style.setProperty("--quiz-accent-soft", _colors.base || _colors.hover);
    _target.style.setProperty("--quiz-accent-glow", _colors.glowStrong || _colors.active);
  }

  function clearCategoryAccent()
  {
    const _target = _elements.main || _elements.page;
    if (!_target)
    {
      return;
    }

    _target.style.removeProperty("--quiz-accent");
    _target.style.removeProperty("--quiz-accent-strong");
    _target.style.removeProperty("--quiz-accent-soft");
    _target.style.removeProperty("--quiz-accent-glow");
  }

  function createWheelSlice(_category, _index, _sliceCount, _metrics)
  {
    const _categoryLabel = _category.title || "Category";
    const _sliceAngle = 360 / _sliceCount;
    const _startAngle = _index * _sliceAngle;
    const _endAngle = _startAngle + _sliceAngle;
    const _labelAngle = _startAngle + _sliceAngle / 2;

    const _sliceGroup = document.createElementNS(_svgNamespace, "g");
    _sliceGroup.classList.add("quiz-slice");
    _sliceGroup.dataset.categoryId = _category.id;
    _sliceGroup.setAttribute("role", "button");
    _sliceGroup.setAttribute("tabindex", "0");
    _sliceGroup.setAttribute("aria-pressed", "false");
    _sliceGroup.setAttribute("aria-label", `Start ${_categoryLabel} quiz`);

    const _path = document.createElementNS(_svgNamespace, "path");
    _path.classList.add("quiz-slice-path");
    _path.setAttribute(
      "d",
      createSlicePath(_metrics.center, _metrics.center, _metrics.radius, _startAngle, _endAngle)
    );

    const _labelPoint = polarToCartesian(_metrics.center, _metrics.center, _metrics.labelRadius, _labelAngle);
    const _halfAngleRadians = (Math.PI / 180) * (_sliceAngle / 2);
    const _sliceWidth = 2 * _metrics.labelRadius * Math.sin(_halfAngleRadians);
    const _iconUrl = typeof _category.icon === "string" ? _category.icon.trim() : "";
    const _hasIcon = _iconUrl.length > 0;

    if (_hasIcon)
    {
      const _rawIconSize = Math.min(_sliceWidth * 0.7, _metrics.radius * 0.45);
      const _iconSize = Math.min(_sliceWidth * 0.85, Math.max(18, _rawIconSize));

      const _icon = document.createElementNS(_svgNamespace, "image");
      _icon.classList.add("quiz-slice-icon");
      _icon.setAttribute("x", (_labelPoint.x - _iconSize / 2).toFixed(2));
      _icon.setAttribute("y", (_labelPoint.y - _iconSize / 2).toFixed(2));
      _icon.setAttribute("width", _iconSize.toFixed(2));
      _icon.setAttribute("height", _iconSize.toFixed(2));
      _icon.setAttribute("href", _iconUrl);
      _icon.setAttributeNS("http://www.w3.org/1999/xlink", "href", _iconUrl);
      _icon.setAttribute("preserveAspectRatio", "xMidYMid meet");
      _icon.setAttribute("aria-hidden", "true");
      _icon.setAttribute("focusable", "false");

      _sliceGroup.append(_path, _icon);
    }
    else
    {
      const _maxTextLength = _sliceWidth * 0.9;
      const _label = document.createElementNS(_svgNamespace, "text");
      _label.classList.add("quiz-slice-label");
      _label.setAttribute("x", _labelPoint.x.toFixed(2));
      _label.setAttribute("y", _labelPoint.y.toFixed(2));
      _label.setAttribute("text-anchor", "middle");
      _label.setAttribute("dominant-baseline", "middle");
      _sliceGroup.style.setProperty("--slice-font-size", `${getSliceFontSize(_categoryLabel, _sliceCount)}px`);

      const _lines = splitSliceLabel(_categoryLabel);
      const _lineHeight = 9;
      const _firstOffset = _lines.length > 1 ? -((_lines.length - 1) * _lineHeight) / 2 : 0;

      _lines.forEach((_line, _lineIndex) =>
      {
        const _tspan = document.createElementNS(_svgNamespace, "tspan");
        _tspan.setAttribute("x", _labelPoint.x.toFixed(2));
        _tspan.setAttribute("dy", _lineIndex === 0 ? `${_firstOffset}` : `${_lineHeight}`);
        if (_line && _line.length > 6)
        {
          _tspan.setAttribute("textLength", _maxTextLength.toFixed(2));
          _tspan.setAttribute("lengthAdjust", "spacingAndGlyphs");
        }
        _tspan.textContent = _line;
        _label.appendChild(_tspan);
      });

      _sliceGroup.append(_path, _label);
    }

    const _sliceColors = resolveSliceColors(_category, _index);
    _sliceGroup.style.setProperty("--slice-color", _sliceColors.base);
    _sliceGroup.style.setProperty("--slice-hover", _sliceColors.hover);
    _sliceGroup.style.setProperty("--slice-active", _sliceColors.active);
    _sliceGroup.style.setProperty("--slice-glow", _sliceColors.glow || _sliceColors.hover);
    _sliceGroup.style.setProperty("--slice-glow-strong", _sliceColors.glowStrong || _sliceColors.active);
    _sliceGroup.style.setProperty("--slice-stroke", _sliceColors.stroke || _sliceColors.hover);
    _sliceGroup.style.setProperty("--slice-stroke-strong", _sliceColors.strokeStrong || _sliceColors.active);

    _sliceGroup.addEventListener("click", (_event) =>
    {
      _event.preventDefault();
      startCategory(_category);
    });

    _sliceGroup.addEventListener("keydown", (_event) =>
    {
      if (_event.key === "Enter" || _event.key === " ")
      {
        _event.preventDefault();
        startCategory(_category);
      }
    });

    _sliceGroup.addEventListener("mouseenter", () =>
    {
      updateCategoryPreview(_category);
    });

    _sliceGroup.addEventListener("mouseleave", () =>
    {
      updateCategoryPreview(null);
    });

    _sliceGroup.addEventListener("focus", () =>
    {
      updateCategoryPreview(_category);
    });

    _sliceGroup.addEventListener("blur", () =>
    {
      updateCategoryPreview(null);
    });

    _categoryCardMap.set(_category.id, _sliceGroup);
    _categoryColorMap.set(_category.id, _sliceColors);
    return _sliceGroup;
  }

  function renderCategoryDetail(_category, _availableCount)
  {
    if (!_elements.categoryDetail)
    {
      return;
    }

    if (!_category)
    {
      renderCategoryStatus("Select a slice to view details.");
      return;
    }

    const _detailCard = document.createElement("div");
    _detailCard.className = "quiz-category-detail-card";

    const _title = document.createElement("h3");
    _title.textContent = _category.title || "Category";

    const _description = document.createElement("p");
    _description.className = "quiz-category-detail-description";
    _description.textContent = _category.description || "Questions from this category.";

    const _meta = document.createElement("div");
    _meta.className = "quiz-category-detail-meta";

    const _questionCount = getQuestionCount(_category);
    const _roundMeta = document.createElement("span");
    _roundMeta.textContent = `${_questionCount} questions per round`;
    _meta.appendChild(_roundMeta);

    if (Number.isFinite(_availableCount))
    {
      const _bankMeta = document.createElement("span");
      _bankMeta.textContent = `${_availableCount} in question bank`;
      _meta.appendChild(_bankMeta);
    }
    else
    {
      const _loadingMeta = document.createElement("span");
      _loadingMeta.textContent = "Question bank loading";
      _meta.appendChild(_loadingMeta);
    }

    const _actions = document.createElement("div");
    _actions.className = "quiz-category-detail-actions";

    const _startButton = document.createElement("button");
    _startButton.type = "button";
    _startButton.className = "btn btn-sm btn-outline-light";
    const _isActive = _state.activeCategory && _state.activeCategory.id === _category.id;
    _startButton.textContent = _isActive ? "Restart quiz" : `Start ${_questionCount}-question quiz`;
    _startButton.addEventListener("click", (_event) =>
    {
      _event.preventDefault();
      startCategory(_category);
    });

    _actions.appendChild(_startButton);
    _detailCard.append(_title, _description, _meta, _actions);

    _elements.categoryDetail.innerHTML = "";
    _elements.categoryDetail.appendChild(_detailCard);
  }

  function applyWheelDensity(_count)
  {
    if (!_elements.wheel)
    {
      return;
    }

    if (_count >= 9)
    {
      _elements.wheel.dataset.density = "dense";
      return;
    }

    if (_count >= 6)
    {
      _elements.wheel.dataset.density = "compact";
      return;
    }

    _elements.wheel.removeAttribute("data-density");
  }


  async function loadCategoryData(_category)
  {
    if (!_category.dataUrl)
    {
      throw new Error("Category dataUrl is missing.");
    }

    if (_categoryDataCache.has(_category.dataUrl))
    {
      return _categoryDataCache.get(_category.dataUrl);
    }

    const _categoryData = await loadJson(_category.dataUrl);
    _categoryDataCache.set(_category.dataUrl, _categoryData);
    return _categoryData;
  }

  function preloadImageUrl(_url)
  {
    if (!_url || typeof _url !== "string")
    {
      return;
    }

    const _trimmedUrl = _url.trim();
    if (!_trimmedUrl || _preloadedImages.has(_trimmedUrl))
    {
      return;
    }

    const _image = new Image();
    _image.decoding = "async";
    _image.src = _trimmedUrl;
    _preloadedImages.add(_trimmedUrl);
  }

  function preloadQuestionImages(_questionIndex)
  {
    const _currentQuestion = _state.questions[_questionIndex];
    if (_currentQuestion && _currentQuestion.image && _currentQuestion.image.url)
    {
      preloadImageUrl(_currentQuestion.image.url);
    }

    const _nextQuestion = _state.questions[_questionIndex + 1];
    if (_nextQuestion && _nextQuestion.image && _nextQuestion.image.url)
    {
      preloadImageUrl(_nextQuestion.image.url);
    }
  }

  function createQuestionImage(_imageData)
  {
    if (!_imageData || !_imageData.url)
    {
      return null;
    }

    const _figure = document.createElement("figure");
    _figure.className = "quiz-question-image";

    const _image = document.createElement("img");
    _image.src = _imageData.url;
    _image.alt = _imageData.alt || "";
    _image.loading = "lazy";
    _image.decoding = "async";

    _figure.appendChild(_image);

    if (_imageData.credit)
    {
      const _caption = document.createElement("figcaption");
      _caption.className = "quiz-image-credit";

      const _creditText = document.createTextNode("Image: ");
      _caption.appendChild(_creditText);

      if (_imageData.creditUrl)
      {
        const _creditLink = document.createElement("a");
        _creditLink.href = _imageData.creditUrl;
        _creditLink.target = "_blank";
        _creditLink.rel = "noopener noreferrer";
        _creditLink.textContent = _imageData.credit;
        _caption.appendChild(_creditLink);
      }
      else
      {
        const _creditName = document.createTextNode(_imageData.credit);
        _caption.appendChild(_creditName);
      }

      _figure.appendChild(_caption);
    }

    return _figure;
  }

  function createFeedbackElements(_question)
  {
    const _feedback = document.createElement("div");
    _feedback.className = "quiz-feedback";
    _feedback.dataset.state = "pending";
    _feedback.setAttribute("role", "status");
    _feedback.setAttribute("aria-live", "polite");

    const _title = document.createElement("p");
    _title.className = "quiz-feedback-title";
    _title.textContent = "Select an answer to view the explanation.";

    const _body = document.createElement("div");
    _body.className = "quiz-feedback-body";
    _body.hidden = true;

    const _answerLine = document.createElement("p");
    _answerLine.className = "quiz-feedback-answer";

    const _explanation = document.createElement("p");
    _explanation.className = "quiz-feedback-explanation";
    _explanation.textContent = _question.explanation || "No explanation available.";

    const _sourceLine = document.createElement("p");
    _sourceLine.className = "quiz-feedback-source";

    if (_question.sourceUrl)
    {
      const _sourceLabel = _question.sourceLabel || "Source";
      const _sourceText = document.createTextNode("Source: ");
      const _sourceLink = document.createElement("a");
      _sourceLink.href = _question.sourceUrl;
      _sourceLink.target = "_blank";
      _sourceLink.rel = "noopener noreferrer";
      _sourceLink.textContent = _sourceLabel;
      _sourceLine.append(_sourceText, _sourceLink);
    }
    else
    {
      _sourceLine.textContent = "Source: Not available";
    }

    _body.append(_answerLine, _explanation, _sourceLine);
    _feedback.append(_title, _body);

    return {
      container: _feedback,
      title: _title,
      body: _body,
      answerLine: _answerLine
    };
  }

  function handleAnswer(_question, _selectedIndex, _choiceButtons, _feedbackElements, _scoreElement)
  {
    const _correctIndex = Number.isInteger(_question.correctIndex) ? _question.correctIndex : -1;
    const _isCorrect = _selectedIndex === _correctIndex;

    _choiceButtons.forEach((_button, _index) =>
    {
      _button.disabled = true;
      if (_index === _correctIndex)
      {
        _button.classList.add("is-correct");
      }
      else if (_index === _selectedIndex)
      {
        _button.classList.add("is-incorrect");
      }
    });

    if (_isCorrect)
    {
      _state.score += 1;
    }

    _state.answers.push({
      questionId: _question.id || `question-${_state.questionIndex + 1}`,
      selectedIndex: _selectedIndex,
      correct: _isCorrect
    });

    const _correctAnswer = _question.choices && _question.choices[_correctIndex]
      ? _question.choices[_correctIndex]
      : "Unknown";

    _feedbackElements.title.textContent = _isCorrect ? "Correct" : "Incorrect";
    _feedbackElements.container.dataset.state = _isCorrect ? "correct" : "incorrect";
    _feedbackElements.answerLine.textContent = `Correct answer: ${_correctAnswer}.`;
    _feedbackElements.body.hidden = false;

    if (_scoreElement)
    {
      _scoreElement.textContent = `Score: ${_state.score} / ${_state.questions.length}`;
    }
  }

  function renderQuestion()
  {
    if (!_elements.quizContainer)
    {
      return;
    }

    const _question = _state.questions[_state.questionIndex];
    if (!_question)
    {
      renderSummary();
      return;
    }

    preloadQuestionImages(_state.questionIndex);

    _elements.quizContainer.innerHTML = "";

    const _card = document.createElement("article");
    _card.className = "quiz-question-card";

    const _meta = document.createElement("div");
    _meta.className = "quiz-meta";

    const _progress = document.createElement("div");
    _progress.className = "quiz-progress";
    _progress.textContent = `Question ${_state.questionIndex + 1} of ${_state.questions.length}`;

    const _scoreText = document.createElement("div");
    _scoreText.className = "quiz-score";
    _scoreText.textContent = `Score: ${_state.score} / ${_state.questions.length}`;

    _meta.append(_progress, _scoreText);

    const _title = document.createElement("h3");
    _title.textContent = _question.prompt || "Question";

    const _progressTrack = document.createElement("div");
    _progressTrack.className = "quiz-progress-track";

    const _progressBar = document.createElement("div");
    _progressBar.className = "quiz-progress-bar";
    const _progressValue = ((_state.questionIndex + 1) / _state.questions.length) * 100;
    _progressBar.style.width = `${_progressValue}%`;
    _progressTrack.appendChild(_progressBar);

    _card.append(_meta, _progressTrack, _title);

    const _imageFigure = createQuestionImage(_question.image);
    if (_imageFigure)
    {
      _card.appendChild(_imageFigure);
    }

    const _feedbackElements = createFeedbackElements(_question);

    const _choicesList = document.createElement("ul");
    _choicesList.className = "quiz-choices";

    const _choiceButtons = [];
    let _hasAnswered = false;

    const _nextButton = document.createElement("button");
    _nextButton.type = "button";
    _nextButton.className = "btn btn-outline-light";
    _nextButton.textContent = "Next question";
    _nextButton.disabled = true;

    _question.choices.forEach((_choice, _index) =>
    {
      const _choiceItem = document.createElement("li");
      const _choiceButton = document.createElement("button");
      _choiceButton.type = "button";
      _choiceButton.className = "quiz-choice";
      _choiceButton.textContent = _choice;
      _choiceButton.addEventListener("click", (_event) =>
      {
        _event.preventDefault();
        if (_hasAnswered)
        {
          return;
        }

        _hasAnswered = true;
        handleAnswer(_question, _index, _choiceButtons, _feedbackElements, _scoreText);

        const _isLastQuestion = _state.questionIndex >= _state.questions.length - 1;
        _nextButton.textContent = _isLastQuestion ? "View results" : "Next question";
        _nextButton.disabled = false;
        _nextButton.focus();
      });

      _choiceButtons.push(_choiceButton);
      _choiceItem.appendChild(_choiceButton);
      _choicesList.appendChild(_choiceItem);
    });

    _nextButton.addEventListener("click", (_event) =>
    {
      _event.preventDefault();
      if (_nextButton.disabled)
      {
        return;
      }

      const _isLastQuestion = _state.questionIndex >= _state.questions.length - 1;
      if (_isLastQuestion)
      {
        renderSummary();
        return;
      }

      _state.questionIndex += 1;
      renderQuestion();
    });

    const _actions = document.createElement("div");
    _actions.className = "quiz-actions";
    _actions.appendChild(_nextButton);

    _card.append(_choicesList, _feedbackElements.container, _actions);
    _elements.quizContainer.appendChild(_card);
  }

  function renderSummary()
  {
    if (!_elements.quizContainer)
    {
      return;
    }

    _elements.quizContainer.innerHTML = "";

    const _summary = document.createElement("article");
    _summary.className = "quiz-summary-card";

    const _title = document.createElement("h3");
    _title.textContent = "Quiz complete";

    const _score = document.createElement("p");
    _score.textContent = `Score: ${_state.score} / ${_state.questions.length}`;

    const _categoryName = _state.activeCategory ? _state.activeCategory.title : "Category";
    const _detail = document.createElement("p");
    _detail.textContent = `Category: ${_categoryName}. Questions selected: ${_state.questions.length} of ${_state.availableQuestionCount}.`;

    const _note = document.createElement("p");
    _note.textContent = "Start again to get a new random set of questions.";

    const _disclaimer = document.createElement("p");
    _disclaimer.textContent = "Pre-release notice: Some answers may be incomplete or need verification.";

    const _actions = document.createElement("div");
    _actions.className = "quiz-actions";

    const _retryButton = document.createElement("button");
    _retryButton.type = "button";
    _retryButton.className = "btn btn-outline-light";
    _retryButton.textContent = "Retry category";
    _retryButton.addEventListener("click", (_event) =>
    {
      _event.preventDefault();
      if (_state.activeCategory)
      {
        startCategory(_state.activeCategory);
      }
    });

    const _chooseButton = document.createElement("button");
    _chooseButton.type = "button";
    _chooseButton.className = "btn btn-outline-light";
    _chooseButton.textContent = "Choose another category";
    _chooseButton.addEventListener("click", (_event) =>
    {
      _event.preventDefault();
      returnToWheel();
    });

    _actions.append(_retryButton, _chooseButton);
    _summary.append(_title, _score, _detail, _note, _disclaimer, _actions);
    _elements.quizContainer.appendChild(_summary);
  }

  async function startCategory(_category)
  {
    try
    {
      setQuizState("active");
      setQuizMessage("Loading quiz...");
      setActiveCategoryCard(_category.id);
      applyCategoryAccent(_category.id);
      updateCategoryTitle(_category);
      updateCategoryPreview(null);
      renderCategoryDetail(_category);
      const _categoryData = await loadCategoryData(_category);
      const _questionList = Array.isArray(_categoryData.questions) ? _categoryData.questions : [];

      if (_questionList.length === 0)
      {
        setQuizMessage("No questions are available for this category.", "error");
        renderCategoryStatus("No questions are available for this category.", "error");
        return;
      }

      const _questionCount = getQuestionCount(_category);
      const _selectedQuestions = selectRandomQuestions(_questionList, _questionCount);
      const _preparedQuestions = _quizConfig.shuffleChoices
        ? _selectedQuestions.map((_question) => shuffleQuestionChoices(_question))
        : _selectedQuestions;

      _state.activeCategory = _category;
      _state.questions = _preparedQuestions;
      _state.questionIndex = 0;
      _state.score = 0;
      _state.answers = [];
      _state.availableQuestionCount = _questionList.length;

      renderCategoryDetail(_category, _questionList.length);
      renderQuestion();
    }
    catch (_error)
    {
      console.error(_error);
      setQuizMessage("Unable to load this quiz. Please refresh the page.", "error");
      renderCategoryStatus("Unable to load this quiz. Please refresh the page.", "error");
    }
  }

  async function loadCategories()
  {
    try
    {
      renderCategoryStatus("Loading categories...");
      const _data = await loadJson(_quizConfig.categoriesUrl);
      const _categories = _data && Array.isArray(_data.categories) ? _data.categories : [];

      if (_categories.length === 0)
      {
        renderCategoryStatus("No categories are configured.", "error");
        return;
      }

      _state.categories = _categories;
      const _metrics = getWheelMetrics(_categories.length);

      if (_elements.categoryContainer)
      {
        _elements.categoryContainer.innerHTML = "";
        _categoryCardMap.clear();
        _categoryColorMap.clear();
        _categories.forEach((_category, _index) =>
        {
          _elements.categoryContainer.appendChild(
            createWheelSlice(_category, _index, _categories.length, _metrics)
          );
        });
      }

      renderCategoryDetail(null);
    }
    catch (_error)
    {
      console.error(_error);
      renderCategoryStatus("Unable to load categories. Please refresh the page.", "error");
      setQuizMessage("Unable to load categories. Please refresh the page.", "error");
    }
  }

  function initQuiz()
  {
    _elements.main = document.querySelector(".quiz-main");
    _elements.page = document.querySelector("[data-quiz-page]");
    _elements.categoryContainer = document.querySelector("[data-quiz-slices]");
    _elements.categoryDetail = document.querySelector("[data-quiz-category-detail]");
    _elements.categoryTitle = document.querySelector("[data-quiz-category-title]");
    _elements.categoryPreview = document.querySelector("[data-quiz-category-preview]");
    _elements.wheel = document.querySelector("[data-quiz-wheel]");
    _elements.quizContainer = document.querySelector("[data-quiz-play]");

    if (!_elements.page || !_elements.categoryContainer || !_elements.categoryDetail || !_elements.quizContainer)
    {
      return;
    }

    setQuizState("idle");
    clearCategoryAccent();
    updateCategoryTitle(null);
    updateCategoryPreview(null);

    if (_elements.categoryTitle)
    {
      _elements.categoryTitle.addEventListener("click", (_event) =>
      {
        _event.preventDefault();
        returnToWheel();
      });
    }

    const _themeObserver = new MutationObserver(() =>
    {
      if (_state.activeCategory)
      {
        applyCategoryAccent(_state.activeCategory.id);
        return;
      }

      clearCategoryAccent();
    });
    _themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    loadCategories();
  }

  if (document.readyState === "loading")
  {
    document.addEventListener("DOMContentLoaded", initQuiz, { once: true });
  }
  else
  {
    initQuiz();
  }
})();
