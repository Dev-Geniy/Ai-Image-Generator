document.addEventListener("DOMContentLoaded", function () {
    const generateButton = document.getElementById("generate");
    const generateMultipleButton = document.getElementById("generate-multiple");
    const textInput = document.getElementById("text-input");
    const loadingSpinner = document.getElementById("loading-spinner");
    const modal = document.getElementById("modal");
    const generatedImagesContainer = document.getElementById("generated-images-container");
    const downloadButton = document.getElementById("download");
    const closeButton = document.querySelector(".close");

    // Скрыть кнопку загрузки изначально
    downloadButton.style.display = "none";

    // Обработчик события для кнопки генерации одного изображения
    generateButton.addEventListener("click", function () {
        generateImage(1); // Генерируем одно изображение
    });

    // Обработчик события для кнопки генерации 5 изображений
    generateMultipleButton.addEventListener("click", function () {
        generateImage(5); // Генерируем 5 изображений
    });

    // Обработчик события для кнопки закрытия модального окна
    closeButton.onclick = function() {
        modal.style.display = "none"; // Закрыть модальное окно
        generatedImagesContainer.innerHTML = ''; // Очистить контейнер изображений
    }

    // Закрыть модальное окно при нажатии на область вне модального окна
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
            generatedImagesContainer.innerHTML = ''; // Очистить контейнер изображений
        }
    }

    // Функция генерации изображения (или изображений)
    function generateImage(count) {
        const description = textInput.value.trim(); // Получаем значение из поля ввода
        if (!description) {
            alert("Пожалуйста, введите описание для генерации изображения."); // Предупреждение, если поле пустое
            return; // Выход из функции, если поле пустое
        }

        displayLoadingState(true);
        const promises = [];
        for (let i = 0; i < count; i++) {
            const encodedDescription = encodeURIComponent(createDescription(description));
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedDescription}?nologo=1&seed=${generateRandomSeed()}&height=512&width=512`;
            const proxyUrl = "https://corsproxy.io/?";
            const proxiedImageUrl = proxyUrl + encodeURIComponent(imageUrl);

            promises.push(fetch(proxiedImageUrl)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Сетевой ответ был не ок");
                    }
                    return response.blob();
                })
                .then((blob) => {
                    return URL.createObjectURL(blob); // Создание URL для изображения
                })
            );
        }

        Promise.all(promises)
            .then(urls => {
                displayGeneratedImages(urls); // Отображение всех изображений
            })
            .catch((error) => {
                alert("Не удалось сгенерировать изображения. Попробуйте еще раз.");
                console.error("Ошибка:", error);
            })
            .finally(() => {
                displayLoadingState(false);
            });
    }

    // Создание описания на основе ввода текста
    function createDescription(inputText) {
        return inputText || "просто изображение"; // Если ничего не введено, генерируем стандартное изображение
    }

    // Генерация случайного числа для seed
    function generateRandomSeed() {
        return Math.floor(Math.random() * 1e9);
    }

    // Отображение состояния загрузки
    function displayLoadingState(isLoading) {
        loadingSpinner.style.display = isLoading ? "block" : "none";
        generateButton.disabled = isLoading; // Заблокировать кнопку, пока идет загрузка
        generateMultipleButton.disabled = isLoading; // Заблокировать кнопку, пока идет загрузка
        if (isLoading) {
            modal.style.display = "none"; // Закрыть модальное окно, если оно открыто
        }
    }

    // Отображение сгенерированных изображений в модальном окне
    function displayGeneratedImages(urls) {
        generatedImagesContainer.innerHTML = ''; // Очистить контейнер изображений
        urls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.style.width = "100%"; // Установка ширины изображения
            img.style.borderRadius = "5px"; // Скругление углов
            img.style.marginBottom = "10px"; // Отступ между изображениями
            generatedImagesContainer.appendChild(img); // Добавление изображения в контейнер
        });
        modal.style.display = "block"; // Открыть модальное окно
    }
});
