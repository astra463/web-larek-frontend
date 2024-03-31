import { ensureElement, cloneTemplate } from './utils/utils';
import { EventEmitter } from './components/base/EventEmitter';
import { StoreAPI } from './components/StoreAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { Events, ProductCategory } from './types';
import { AppState, CardPreview, CatalogChangeEvent } from './components/AppData';
import { Page } from './components/Page';
import { Card } from './components/Card';
import './scss/styles.scss';
import { Modal } from './components/common/Modal';

const events = new EventEmitter();
const api = new StoreAPI(CDN_URL, API_URL);
const appData = new AppState({}, events)

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);


// Все шаблоны
const successModalTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewModalTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');


// Переиспользуемые части интерфейса



// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
  console.log(eventName, data);
});

// Получаем лоты с сервера
api.getProductList()
  .then(appData.setCatalog.bind(appData))
  .catch(err => {
    console.error(err);
  });

// Изменились элементы каталога
events.on<CatalogChangeEvent>(Events.CATALOG_CHANGED, () => {
  page.gallery = appData.catalog.map(item => {
    const card = new Card<ProductCategory>('card', cloneTemplate(cardTemplate), {
      onClick: () => events.emit(Events.CARD_SELECTED, item)
    });
    return card.render({
      title: item.title,
      image: item.image,
      category: item.category,
      price: item.price,
    });
  });
});

// Открыли карточку
events.on<CardPreview>(Events.CARD_SELECTED, (item) => {
  const card = new Card<CardPreview>('card', cloneTemplate(cardPreviewModalTemplate), {
    onClick: () => console.log('clissk')
  });

  const previewModal = new Modal(ensureElement<HTMLElement>('#modal-preview'), events);
  console.log(previewModal);

  previewModal.render({
    content: card.render({
      title: item.title,
      image: item.image,
      category: item.category,
      price: item.price,
    })
  });
  page.locked = true; 

});

events.on(Events.MODAL_CLOSED, () => {
  page.locked = false;
})