document.addEventListener('DOMContentLoaded', function () {

    let selectedRating = 0;

    const starEls = document.querySelectorAll('#starPicker span');

    starEls.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const val = +star.dataset.v;
            starEls.forEach(s => s.classList.toggle('active', +s.dataset.v <= val));
        });

        star.addEventListener('mouseleave', () => {
            starEls.forEach(s => s.classList.toggle('active', +s.dataset.v <= selectedRating));
        });

        star.addEventListener('click', () => {
            selectedRating = +star.dataset.v;
            starEls.forEach(s => s.classList.toggle('active', +s.dataset.v <= selectedRating));
        });
    });

    window.submitReview = function () {
        const name = document.getElementById('reviewName').value.trim();
        const review = document.getElementById('reviewText').value.trim();

        if (!name) { document.getElementById('reviewName').focus(); return; }
        if (!selectedRating) { return; }
        if (!review) { document.getElementById('reviewText').focus(); return; }

        const starStr = '★'.repeat(selectedRating) + '☆'.repeat(5 - selectedRating);

        const card = document.createElement('div');
        card.className = 'box new-box';
        card.innerHTML = `
      <img src="../images/default-image-girl.png" alt="${name}" onerror="this.style.display='none'">
      <h3>${name}</h3>
      <div class="stars">${starStr}</div>
      <p>"${review}"</p>
    `;

        document.getElementById('reviewsGrid').appendChild(card);
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });

        document.getElementById('reviewName').value = '';
        document.getElementById('reviewText').value = '';
        selectedRating = 0;
        starEls.forEach(s => s.classList.remove('active'));

        const toast = document.getElementById('reviewToast');
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 3000);
    };

});