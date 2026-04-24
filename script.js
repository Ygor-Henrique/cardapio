/**
 * HAMBURGUERIA EXEMPLO - DIGITAL MENU JS
 * Cart Logic & WhatsApp Integration
 */

let cart = [];
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load Dynamic Information from Admin
    loadSiteInfo();

    // Smooth scrolling for category buttons
    const catButtons = document.querySelectorAll('.cat-btn');
    catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetHeader = document.getElementById(`section-${targetId}`);

            if (targetHeader) {
                // Adjust for sticky header height
                const offset = 70;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = targetHeader.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update active state immediately (scroll listener will also do this)
                updateActiveCategory(targetId);
            }
        });
    });

    // Intersection Observer to highlight active category on scroll
    const sections = document.querySelectorAll('.product-section');
    const observerOptions = {
        root: null,
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id.replace('section-', '');
                updateActiveCategory(id);
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
});

/**
 * Loads configured site data from localStorage
 */
function loadSiteInfo() {
    const config = JSON.parse(localStorage.getItem('hamburgueria_config') || '{}');
    
    if (config.brandName) {
        const brands = document.querySelectorAll('#info-brand-name, #footer-brand-name');
        brands.forEach(el => el.innerHTML = config.brandName);
    }
    if (config.address) {
        document.getElementById('info-address').innerText = config.address;
        document.getElementById('footer-address').innerText = `📍 ${config.address}`;
    }
    if (config.hoursWeek) {
        document.getElementById('info-hours').innerText = `${config.hoursWeek} | ${config.hoursWeekend || ''}`;
        document.getElementById('footer-hours-week').innerText = `🕐 ${config.hoursWeek}`;
    }
    if (config.hoursWeekend) {
        document.getElementById('footer-hours-weekend').innerText = `🕐 ${config.hoursWeekend}`;
    }
    if (config.delivery) {
        document.getElementById('info-delivery').innerText = `Entrega: ${config.delivery}`;
    }
    if (config.whatsapp) {
        document.getElementById('footer-whatsapp-text').innerText = `WhatsApp: ${config.whatsapp}`;
        
        const footerLink = document.getElementById('footer-whatsapp-link');
        const fabLink = document.getElementById('whatsapp-fab');
        
        if (footerLink) footerLink.href = `https://wa.me/${config.whatsapp}`;
        if (fabLink) fabLink.href = `https://wa.me/${config.whatsapp}`;
    }
}

/**
 * Updates the active class on category buttons
 */
function updateActiveCategory(id) {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        if (btn.getAttribute('data-target') === id) {
            btn.classList.add('active');
            // Scroll nav items into view if hidden
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Adds an item to the shopping cart
 */
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    // Visual feedback on button
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.classList.add('added');
    btn.innerHTML = '<span>Adicionado!</span>';
    setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = originalText;
    }, 1000);

    updateCartUI();
}

/**
 * Removes an item or decreases quantity
 */
function removeFromCart(name) {
    const index = cart.findIndex(item => item.name === name);
    if (index > -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
    }
    updateCartUI();
}

/**
 * Increases quantity from within the cart panel
 */
function increaseQty(name) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += 1;
        updateCartUI();
    }
}

/**
 * Updates the Cart UI elements (FAB count, items list, totals)
 */
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartFooter = document.getElementById('cart-footer');
    const totalEl = document.getElementById('cart-total');

    // Update count on FAB
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalItems;
    if (totalItems > 0) {
        cartCount.classList.add('visible');
    } else {
        cartCount.classList.remove('visible');
    }

    // Update cart list
    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartEmpty.classList.remove('hidden');
        cartFooter.classList.remove('visible');
    } else {
        cartEmpty.classList.add('hidden');
        cartFooter.classList.add('visible');

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="cart-qty-ctrl">
                    <button class="qty-btn" onclick="removeFromCart('${item.name}')">−</button>
                    <span class="qty-num">${item.quantity}</span>
                    <button class="qty-btn" onclick="increaseQty('${item.name}')">+</button>
                </div>
            `;
            cartItems.appendChild(li);
        });
    }

    totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

/**
 * Toggles cart panel visibility
 */
function toggleCart() {
    document.getElementById('cart-panel').classList.add('active');
    document.getElementById('cart-overlay').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
}

/**
 * Closes cart panel
 */
function closeCart() {
    document.getElementById('cart-panel').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Clears entire cart
 */
function clearCart() {
    cart = [];
    updateCartUI();
}

/**
 * Formats order and sends to WhatsApp
 */
function sendWhatsApp() {
    if (cart.length === 0) return;

    const userName = document.getElementById('user-name').value.trim();
    const userAddress = document.getElementById('user-address').value.trim();
    const userPayment = document.getElementById('user-payment').value;

    if (!userName || !userAddress || !userPayment) {
        alert("Por favor, preencha todos os dados da entrega antes de finalizar o pedido.");
        return;
    }

    let message = "Olá! Quero fazer um pedido:\n\n";

    cart.forEach(item => {
        message += `✅ *${item.quantity}x* ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    message += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')} (Entrega Grátis)*\n`;
    message += `\n👤 *Nome:* ${userName}`;
    message += `\n📍 *Endereço:* ${userAddress}`;
    message += `\n💳 *Pagamento:* ${userPayment}`;

    // Read configured number or fallback to placeholder
    const config = JSON.parse(localStorage.getItem('hamburgueria_config') || '{}');
    const phone = config.whatsapp || "5511999999999";
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}
