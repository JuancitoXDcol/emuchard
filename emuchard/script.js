document.addEventListener('DOMContentLoaded', () => {
  const forumForm = document.getElementById('forum-form');
  const usernameInput = document.getElementById('username');
  const commentInput = document.getElementById('comment');
  const imageInput = document.getElementById('image-upload');
  const fileNameSpan = document.getElementById('file-name');
  const commentsList = document.getElementById('comments-list');

  // Mostrar el nombre del archivo seleccionado
  imageInput.addEventListener('change', () => {
    if (imageInput.files && imageInput.files[0]) {
      fileNameSpan.textContent = imageInput.files[0].name;
    } else {
      fileNameSpan.textContent = 'Sin archivo seleccionado';
    }
  });

  // Cargar comentarios almacenados
  loadComments();

  // Guardar nuevo comentario
  forumForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const comment = commentInput.value.trim();
    const file = imageInput.files[0];

    if (!username || !comment) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        saveComment(username, comment, e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      saveComment(username, comment, null);
    }
  });

  function saveComment(username, comment, imageData) {
    const newComment = {
      id: Date.now(),
      username,
      comment,
      image: imageData,
      date: new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const comments = JSON.parse(localStorage.getItem('emuchard_comments') || '[]');
    comments.unshift(newComment);
    localStorage.setItem('emuchard_comments', JSON.stringify(comments));

    // Limpiar formulario y recargar
    forumForm.reset();
    fileNameSpan.textContent = 'Sin archivo seleccionado';
    renderComments(comments);
  }

  function loadComments() {
    const comments = JSON.parse(localStorage.getItem('emuchard_comments') || '[]');
    renderComments(comments);
  }

  function renderComments(comments) {
    commentsList.innerHTML = '';

    if (comments.length === 0) {
      commentsList.innerHTML = '<p style="color: #6c789c; text-align: center;">Sé el primero en comentar algo en la comunidad.</p>';
      return;
    }

    comments.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'comment-card';

      let imageHTML = item.image 
        ? `<img src="${item.image}" alt="Imagen adjunta por ${item.username}" class="comment-image">` 
        : '';

      card.innerHTML = `
        <div class="comment-header">
          <span class="comment-author">${escapeHTML(item.username)}</span>
          <span class="comment-date">${item.date}</span>
        </div>
        <div class="comment-body">${escapeHTML(item.comment)}</div>
        ${imageHTML}
      `;

      commentsList.appendChild(card);
    });
  }

  // Prevención de ataques XSS básicos
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});
