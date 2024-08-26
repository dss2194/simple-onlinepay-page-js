import { h, mount } from 'redom';
   import { z } from 'zod';

   const app = document.getElementById('app');

   // Создаем схему валидации с помощью Zod
   const cardSchema = z.object({
       cardNumber: z.string().refine(value => /^[0-9\s]{19}$/.test(value.replace(/\s/g, '')), {
           message: 'Некорректный номер карты',
       }),
       expiryDate: z.string().refine(value => {
           const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
           const [month, year] = value.split('/');
           const currentDate = new Date();
           const expiryDate = new Date(`20${year}`, month - 1);

           return regex.test(value) && expiryDate > currentDate;
       }, {
           message: 'Некорректная дата',
       }),
       cvc: z.string().length(3, { message: 'Введите 3 цифры' }),
       email: z.string().email({ message: 'Некорректный email' }),
   });

   // HTML-структура формы
   const form = h('form#payment-form', [
       h('div', [
           h('label', { for: 'cardNumber' }, 'Номер карты:'),
           h('input#cardNumber', { required: true }),
           h('div.error-message', { id: 'cardNumberError' }, ''),
       ]),
       h('div', [
           h('label', { for: 'expiryDate' }, 'Дата окончания (ММ/ГГ):'),
           h('input#expiryDate', { required: true }),
           h('div.error-message', { id: 'expiryDateError' }, ''),
       ]),
       h('div', [
           h('label', { for: 'cvc' }, 'CVC/CVV:'),
           h('input#cvc', { maxlength: 3, required: true }),
           h('div.error-message', { id: 'cvcError' }, ''),
       ]),
       h('div', [
           h('label', { for: 'email' }, 'Email:'),
           h('input#email', { required: true }),
           h('div.error-message', { id: 'emailError' }, ''),
       ]),
       h('button#payButton', { type: 'submit', disabled: true }, 'Оплатить'),
   ]);

   // Добавляем форму в приложение
   mount(app, form);

   // Форматируем номер карты
   const formatCardNumber = (value) => {
       return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
   };

   // Проверка всех полей
   const checkAllFields = () => {
       const cardNumber = document.getElementById('cardNumber').value;
       const expiryDate = document.getElementById('expiryDate').value;
       const cvc = document.getElementById('cvc').value;
       const email = document.getElementById('email').value;

       const result = cardSchema.safeParse({
           cardNumber,
           expiryDate,
           cvc,
           email,
       });

       const payButton = document.getElementById('payButton');
       payButton.disabled = !result.success;

       // Отображение ошибок
       const errors = {
           cardNumberError: result.success ? '' : result.error.errors.find(e => e.path[0] === 'cardNumber')?.message,
           expiryDateError: result.success ? '' : result.error.errors.find(e => e.path[0] === 'expiryDate')?.message,
           cvcError: result.success ? '' : result.error.errors.find(e => e.path[0] === 'cvc')?.message,
           emailError: result.success ? '' : result.error.errors.find(e => e.path[0] === 'email')?.message,
       };

       document.getElementById('cardNumberError').textContent = errors.cardNumberError;
       document.getElementById('expiryDateError').textContent = errors.expiryDateError;
       document.getElementById('cvcError').textContent = errors.cvcError;
       document.getElementById('emailError').textContent = errors.emailError;
   }

   // Обработчики событий
   document.getElementById('cardNumber').addEventListener('input', (e) => {
       e.target.value = formatCardNumber(e.target.value);
       checkAllFields();
   });

   document.getElementById('expiryDate').addEventListener('input', (e) => {
       let value = e.target.value.replace(/\D/g, '');
       if (value.length >= 2) {
           value = value.slice(0, 2) + '/' + value.slice(2, 4);
       }
       e.target.value = value;
       checkAllFields();
   });

   document.querySelectorAll('input').forEach(input => {
       input.addEventListener('input', checkAllFields);
   });