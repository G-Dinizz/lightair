/**
 * ============================================================
 * LightAir Systems — Landing Page · JavaScript Principal
 * ============================================================
 *
 * Arquivo de interatividade da landing page premium.
 * Vanilla ES6+ · Sem dependências externas.
 *
 * Funcionalidades:
 *   1. Efeito de scroll na navbar
 *   2. Menu mobile (hambúrguer)
 *   3. Smooth scroll para âncoras
 *   4. Animações de revelação ao scroll (IntersectionObserver)
 *   5. Contadores animados
 *   6. Validação e envio do formulário de contato
 *   7. Destaque do link ativo na navegação
 *   8. Efeito parallax sutil no hero
 *
 * © LightAir Systems — Todos os direitos reservados.
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ──────────────────────────────────────────────────────────
  // Utilitários
  // ──────────────────────────────────────────────────────────

  /**
   * Seleciona um elemento do DOM com verificação de nulidade.
   * @param {string} selector  — Seletor CSS
   * @param {Element} [parent] — Escopo da busca (default: document)
   * @returns {Element|null}
   */
  const qs = (selector, parent = document) => parent.querySelector(selector);

  /**
   * Seleciona múltiplos elementos do DOM.
   * @param {string} selector
   * @param {Element} [parent]
   * @returns {Element[]}
   */
  const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  // ──────────────────────────────────────────────────────────
  // 1. Efeito de Scroll na Navbar
  // ──────────────────────────────────────────────────────────

  const navbar = qs('.navbar');

  if (navbar) {
    const SCROLL_THRESHOLD = 50;

    const handleNavbarScroll = () => {
      // Alterna a classe .scrolled para aplicar estilos visuais
      navbar.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
    };

    // Listener passivo — não bloqueia o scroll do navegador
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });

    // Executa imediatamente para cobrir recarregamentos no meio da página
    handleNavbarScroll();
  }

  // ──────────────────────────────────────────────────────────
  // 2. Menu Mobile (Hambúrguer)
  // ──────────────────────────────────────────────────────────

  const navToggle = qs('.nav-toggle');
  const navMenu = qs('.nav-menu');

  if (navToggle && navMenu) {
    /**
     * Abre ou fecha o menu mobile e controla o overflow do body.
     * @param {boolean} [forceClose] — Se true, força o fechamento
     */
    const toggleMenu = (forceClose = false) => {
      const shouldOpen = forceClose ? false : !navMenu.classList.contains('active');

      navMenu.classList.toggle('active', shouldOpen);
      navToggle.classList.toggle('active', shouldOpen);

      // Impede scroll do body quando o menu está aberto
      document.body.style.overflow = shouldOpen ? 'hidden' : '';
    };

    // Botão hambúrguer
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Fecha ao clicar num link de navegação
    qsa('.nav-menu__link, .nav-menu__cta a', navMenu).forEach((link) => {
      link.addEventListener('click', () => toggleMenu(true));
    });

    // Fecha ao clicar fora do menu
    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        toggleMenu(true);
      }
    });

    // Fecha ao pressionar Escape (acessibilidade)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        toggleMenu(true);
        navToggle.focus();
      }
    });
  }

  // ──────────────────────────────────────────────────────────
  // 3. Smooth Scroll para Âncoras
  // ──────────────────────────────────────────────────────────

  const NAVBAR_OFFSET = 80; // Altura aproximada da navbar fixa

  qsa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');

      // Ignora links "#" vazios
      if (targetId === '#' || targetId.length <= 1) return;

      const targetEl = qs(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    });
  });

  // ──────────────────────────────────────────────────────────
  // 4. Animações de Revelação ao Scroll (Scroll Reveal)
  // ──────────────────────────────────────────────────────────

  const revealElements = qsa('.reveal');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Desobserva após revelar — animação única
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        // Margem negativa para disparar um pouco antes de entrar completamente
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: mostra tudo imediatamente se IO não estiver disponível
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  // ──────────────────────────────────────────────────────────
  // 5. Contadores Animados
  // ──────────────────────────────────────────────────────────

  const counterElements = qsa('.counter[data-target]');

  if (counterElements.length > 0 && 'IntersectionObserver' in window) {
    /**
     * Anima um contador de 0 até o valor de data-target.
     * Usa easeOutQuad para desaceleração natural.
     * @param {Element} el — Elemento .counter
     */
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target) || target <= 0) {
        el.textContent = '0';
        return;
      }

      const duration = 2000; // 2 segundos
      const startTime = performance.now();

      /**
       * Easing ease-out quadrático.
       * @param {number} t — Progresso normalizado (0–1)
       * @returns {number}
       */
      const easeOutQuad = (t) => t * (2 - t);

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuad(progress);
        const currentValue = Math.round(easedProgress * target);

        // Formata no padrão brasileiro (pt-BR): 1.234, 12.345 etc.
        el.textContent = currentValue.toLocaleString('pt-BR');

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counterElements.forEach((el) => counterObserver.observe(el));
  }

  // ──────────────────────────────────────────────────────────
  // 6. Validação e Envio do Formulário de Contato
  // ──────────────────────────────────────────────────────────

  const contactForm = qs('#contact-form');

  if (contactForm) {
    // Regex de validação de e-mail (RFC 5322 simplificada)
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /**
     * Regras de validação por campo.
     * Cada regra retorna uma string de erro ou null se válido.
     */
    const validationRules = {
      nome: (value) => {
        if (!value.trim()) return 'Por favor, informe seu nome.';
        if (value.trim().length < 2) return 'O nome deve ter pelo menos 2 caracteres.';
        return null;
      },
      email: (value) => {
        if (!value.trim()) return 'Por favor, informe seu e-mail.';
        if (!EMAIL_REGEX.test(value.trim())) return 'Por favor, informe um e-mail válido.';
        return null;
      },
      telefone: () => null, // Opcional — sempre válido
      mensagem: () => null,  // Opcional — sempre válido
    };

    /**
     * Exibe ou limpa o erro visual de um campo.
     * @param {Element} field — O input/textarea
     * @param {string|null} message — Mensagem de erro (null = sem erro)
     */
    const setFieldError = (field, message) => {
      const errorEl = field.parentElement
        ? field.parentElement.querySelector('.field-error')
        : null;

      if (message) {
        field.classList.add('error');
        if (errorEl) {
          errorEl.textContent = message;
          errorEl.style.display = 'block';
        }
      } else {
        field.classList.remove('error');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.style.display = 'none';
        }
      }
    };

    /**
     * Valida um campo individual.
     * @param {Element} field
     * @returns {boolean} — true se válido
     */
    const validateField = (field) => {
      const name = field.name || field.id;
      const rule = validationRules[name];

      if (!rule) return true; // Sem regra = válido

      const error = rule(field.value);
      setFieldError(field, error);
      return error === null;
    };

    // Validação inline no blur (não no keypress — melhor UX)
    const formFields = qsa('.form-group__input, .form-group__textarea', contactForm);

    formFields.forEach((field) => {
      field.addEventListener('blur', () => validateField(field));

      // Limpa erro enquanto o usuário digita (feedback positivo)
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
          validateField(field);
        }
      });
    });

    /**
     * Valida todos os campos do formulário.
     * @returns {{ isValid: boolean, firstInvalid: Element|null }}
     */
    const validateAllFields = () => {
      let isValid = true;
      let firstInvalid = null;

      formFields.forEach((field) => {
        const fieldValid = validateField(field);
        if (!fieldValid && isValid) {
          isValid = false;
          firstInvalid = field;
        }
      });

      return { isValid, firstInvalid };
    };

    /**
     * Exibe a notificação de sucesso.
     */
    const showSuccess = () => {
      const successEl = qs('.form-success');
      if (successEl) {
        successEl.classList.add('active');
        successEl.style.display = 'block';

        // Remove a notificação após 5 segundos
        setTimeout(() => {
          successEl.classList.remove('active');
          // Aguarda a animação de saída
          setTimeout(() => {
            successEl.style.display = 'none';
          }, 400);
        }, 5000);
      }
    };

    // Tratamento do envio
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const { isValid, firstInvalid } = validateAllFields();

      if (!isValid) {
        // Foca no primeiro campo inválido
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // --- Envio simulado ---
      const submitBtn = qs('button[type="submit"], input[type="submit"]', contactForm);
      const originalText = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        submitBtn.classList.add('loading');
      }

      // Simula delay de envio (substituir pela chamada real à API)
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          submitBtn.classList.remove('loading');
        }

        // Limpa o formulário
        contactForm.reset();
        formFields.forEach((field) => setFieldError(field, null));

        // Exibe mensagem de sucesso
        showSuccess();
      }, 1500);
    });
  }

  // ──────────────────────────────────────────────────────────
  // 7. Destaque do Link Ativo na Navegação
  // ──────────────────────────────────────────────────────────

  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-menu__link[href^="#"], .nav-menu__cta a[href^="#"]');

  if (sections.length > 0 && navLinks.length > 0 && 'IntersectionObserver' in window) {
    const activeLinkObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;

            // Remove .active de todos os links
            navLinks.forEach((link) => link.classList.remove('active'));

            // Adiciona .active ao link correspondente
            const matchingLink = navLinks.find(
              (link) => link.getAttribute('href') === `#${sectionId}`
            );
            if (matchingLink) {
              matchingLink.classList.add('active');
            }
          }
        });
      },
      {
        // rootMargin negativo — detecta quando a seção está no terço superior da viewport
        rootMargin: '-20% 0px -75% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => activeLinkObserver.observe(section));
  }

  // ──────────────────────────────────────────────────────────
  // 8. Efeito Parallax Sutil no Hero
  // ──────────────────────────────────────────────────────────

  const hero = qs('.hero');
  const heroShapes = hero ? qsa('.hero-shape, .hero-decoration, .floating-shape', hero) : [];

  if (hero && heroShapes.length > 0) {
    const MAX_MOVEMENT = 12; // Movimento máximo em pixels
    let rafId = null;
    let mouseX = 0;
    let mouseY = 0;

    /**
     * Aplica a transformação parallax nos elementos decorativos.
     * Executado via requestAnimationFrame para performance.
     */
    const applyParallax = () => {
      const heroBounds = hero.getBoundingClientRect();
      // Normaliza a posição do mouse (-1 a 1) relativa ao hero
      const xNorm = ((mouseX - heroBounds.left) / heroBounds.width - 0.5) * 2;
      const yNorm = ((mouseY - heroBounds.top) / heroBounds.height - 0.5) * 2;

      heroShapes.forEach((shape, index) => {
        // Cada elemento se move com intensidade ligeiramente diferente
        const factor = 1 - index * 0.15;
        const moveX = xNorm * MAX_MOVEMENT * factor;
        const moveY = yNorm * MAX_MOVEMENT * factor;

        shape.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      rafId = null; // Libera para o próximo frame
    };

    hero.addEventListener(
      'mousemove',
      (e) => {
        // Apenas desktop (> 1024px)
        if (window.innerWidth <= 1024) return;

        mouseX = e.clientX;
        mouseY = e.clientY;

        // Throttle via rAF — no máximo 1 atualização por frame
        if (!rafId) {
          rafId = requestAnimationFrame(applyParallax);
        }
      },
      { passive: true }
    );

    // Reseta posições ao sair do hero
    hero.addEventListener(
      'mouseleave',
      () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        heroShapes.forEach((shape) => {
          shape.style.transform = 'translate(0, 0)';
          shape.style.transition = 'transform 0.5s ease-out';
          // Remove a transition após a animação de retorno
          setTimeout(() => {
            shape.style.transition = '';
          }, 500);
        });
      },
      { passive: true }
    );
  }

  // ──────────────────────────────────────────────────────────
  // Inicialização completa
  // ──────────────────────────────────────────────────────────
  // eslint-disable-next-line no-console
  console.log('%c✈ LightAir Systems — Pronto para voar.', 'color: #00a8e8; font-weight: bold;');
});
