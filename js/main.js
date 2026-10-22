// JavaScript нужен только для модального окна и проверки форм.
// Основная часть контрольной работы — HTML и CSS.

// ---------- Модальное окно (есть на index.html и catalog.html) ----------

// Получаем модальное окно по id.
const orderDialog = document.getElementById('order-dialog');

// Если на странице нет модального окна, этот блок пропускаем.
if (orderDialog) {
  // Получаем все кнопки «Заказать» в карточках товаров.
  const orderButtons = document.querySelectorAll('.product-card__button');

  // Получаем кнопку закрытия модального окна.
  const closeDialogButton = document.getElementById('close-order-dialog');

  // Скрытое поле и текст, в которые записывается выбранный товар.
  const selectedProductInput = document.getElementById('selected-product');
  const dialogProduct = document.getElementById('order-dialog-product');

  // Перебираем все кнопки «Заказать».
  orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Название товара берём из data-атрибута.
      const productName = button.dataset.product;

      selectedProductInput.value = productName;
      dialogProduct.textContent = productName;

      // Открываем модальное окно.
      orderDialog.showModal();
    });
  });

  // Закрываем модальное окно по кнопке «Закрыть».
  closeDialogButton.addEventListener('click', () => {
    orderDialog.close();
  });
}

// ---------- Проверка форм (на всех страницах, где есть формы) ----------

const forms = document.querySelectorAll('form[data-success]');

forms.forEach((form) => {
  // Сообщение об успешной отправке для этой формы.
  const successMessage = document.getElementById(form.dataset.success);

  form.addEventListener('submit', (event) => {
    // Отменяем стандартную отправку, потому что backend пока не подключён.
    event.preventDefault();

    const formElements = Array.from(form.elements);

    // Сбрасываем предыдущие признаки ошибок.
    formElements.forEach((element) => {
      element.removeAttribute('aria-invalid');
    });

    // Проверяем встроенные HTML-ограничения (required, type="email", pattern).
    if (!form.checkValidity()) {
      formElements.forEach((element) => {
        if (element.willValidate && !element.checkValidity()) {
          element.setAttribute('aria-invalid', 'true');
        }
      });

      // Показываем стандартные сообщения браузера.
      form.reportValidity();
      return;
    }

    // Показываем сообщение об успехе и очищаем форму.
    successMessage.hidden = false;
    form.reset();

    // Если форма находится в модальном окне — закрываем его.
    if (orderDialog && orderDialog.contains(form)) {
      orderDialog.close();
    }
  });
});
