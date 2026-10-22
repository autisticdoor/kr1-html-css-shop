// JavaScript нужен для модального окна, проверки форм и мелких улучшений форм.
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

// ---------- Маска телефона ----------

// Приводит введённые цифры к виду +7 (900) 000-00-00.
function formatPhone(value) {
  let digits = value.replace(/\D/g, '');

  // Если номер начинается с 7 или 8 (вставка из буфера), убираем первую цифру.
  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);

  if (digits === '') {
    return '';
  }

  let result = '+7 (' + digits.slice(0, 3);
  if (digits.length >= 3) result += ')';
  if (digits.length > 3) result += ' ' + digits.slice(3, 6);
  if (digits.length > 6) result += '-' + digits.slice(6, 8);
  if (digits.length > 8) result += '-' + digits.slice(8, 10);
  return result;
}

document.querySelectorAll('input[type="tel"]').forEach((input) => {
  input.addEventListener('input', () => {
    input.value = formatPhone(input.value);
  });
});

// ---------- Сообщения об ошибках под полями ----------

// Возвращает понятный текст ошибки для поля.
function getErrorMessage(element) {
  const validity = element.validity;

  if (validity.valueMissing) {
    if (element.type === 'checkbox') return 'Нужно ваше согласие на обработку данных';
    if (element.tagName === 'SELECT') return 'Выберите вариант из списка';
    return 'Заполните это поле';
  }
  if (validity.typeMismatch) {
    if (element.type === 'email') return 'Введите корректный e-mail, например example@mail.ru';
    return 'Введите ссылку полностью, вместе с https://';
  }
  if (validity.patternMismatch) {
    if (element.type === 'tel') return 'Введите телефон в формате +7 (900) 000-00-00';
    return element.dataset.error || 'Неверный формат';
  }
  if (validity.tooShort) {
    return 'Введите не менее ' + element.minLength + ' символов';
  }
  return element.validationMessage;
}

// Показывает ошибку под полем и помечает поле как неверное.
function showError(element) {
  const field = element.closest('.order-form__field');
  let error = field.querySelector('.order-form__error');

  if (!error) {
    error = document.createElement('p');
    error.className = 'order-form__error';
    error.id = element.id + '-error';
    field.appendChild(error);
  }

  error.textContent = getErrorMessage(element);
  element.setAttribute('aria-invalid', 'true');
  element.setAttribute('aria-describedby', error.id);
}

// Убирает ошибку у поля.
function clearError(element) {
  const field = element.closest('.order-form__field');
  const error = field ? field.querySelector('.order-form__error') : null;

  if (error) error.remove();
  element.removeAttribute('aria-invalid');
  element.removeAttribute('aria-describedby');
}

// ---------- Уведомление об успешной отправке ----------

let messageTimer;

function showSuccess(message, text) {
  message.textContent = text;
  message.hidden = false;

  // Через 6 секунд уведомление исчезает.
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    message.hidden = true;
  }, 6000);
}

// ---------- Страница заявки: выбор товара и «Ваш заказ» ----------

const productSelect = document.getElementById('order-product');

if (productSelect) {
  const summaryProduct = document.getElementById('order-summary-product');
  const summaryPrice = document.getElementById('order-summary-price');

  const updateSummary = () => {
    const option = productSelect.selectedOptions[0];
    summaryProduct.textContent = productSelect.value || 'не выбран';
    summaryPrice.textContent = option.dataset.price || '—';
  };

  // Товар можно передать в адресе: order.html?product=AK-47%20%7C%20Redline
  const wantedProduct = new URLSearchParams(window.location.search).get('product');
  if (wantedProduct) {
    productSelect.value = wantedProduct;
  }

  productSelect.addEventListener('change', updateSummary);
  productSelect.form.addEventListener('reset', () => setTimeout(updateSummary));
  updateSummary();
}

// ---------- Проверка форм (на всех страницах, где есть формы) ----------

const forms = document.querySelectorAll('form[data-success]');

forms.forEach((form) => {
  // Сообщение об успешной отправке для этой формы.
  const successMessage = document.getElementById(form.dataset.success);

  // Пока пользователь исправляет поле, перепроверяем его.
  form.addEventListener('input', (event) => {
    const element = event.target;
    if (element.getAttribute('aria-invalid') === 'true') {
      if (element.checkValidity()) {
        clearError(element);
      } else {
        showError(element);
      }
    }
  });

  form.addEventListener('change', (event) => {
    const element = event.target;
    if (element.getAttribute('aria-invalid') === 'true' && element.checkValidity()) {
      clearError(element);
    }
  });

  form.addEventListener('submit', (event) => {
    // Отменяем стандартную отправку, потому что backend пока не подключён.
    event.preventDefault();

    const formElements = Array.from(form.elements).filter((element) => element.willValidate);
    const invalidElements = formElements.filter((element) => !element.checkValidity());

    // Убираем ошибки у полей, которые стали верными.
    formElements.forEach((element) => {
      if (element.checkValidity()) clearError(element);
    });

    // Если есть ошибки — показываем их под полями и переходим к первому полю.
    if (invalidElements.length > 0) {
      invalidElements.forEach(showError);
      invalidElements[0].focus();
      return;
    }

    // Название товара (если есть) попадёт в текст уведомления.
    const productField = form.elements['product'] || form.elements['selected-product'];
    const productName = productField ? productField.value : '';

    const text = productName
      ? 'Заявка на «' + productName + '» отправлена! Мы свяжемся с вами в течение дня.'
      : 'Сообщение отправлено! Мы ответим вам в течение дня.';

    form.reset();
    showSuccess(successMessage, text);

    // Если форма находится в модальном окне — закрываем его.
    if (orderDialog && orderDialog.contains(form)) {
      orderDialog.close();
    }
  });
});
