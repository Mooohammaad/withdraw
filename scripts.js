AOS.init({
            duration: 1200,
        });
        document.addEventListener('DOMContentLoaded', function() {
        AOS.init({
            duration: 1200,
        });
    });

document.addEventListener('DOMContentLoaded', () => {
    const pointsBox = document.getElementById('points');
    const addPointsBtn = document.getElementById('add-points-btn');
    const addPointsModal = document.getElementById('add-points-modal');
    const closeModal = document.querySelector('.close');
    const addPointsForm = document.getElementById('add-points-form');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const userIdInput = document.getElementById('user-id');
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const userIdError = document.getElementById('user-id-error');
    let points = 0;
    let usedUserIds = {};

    const storedUserIds = localStorage.getItem('usedUserIds');
    if (storedUserIds) {
        usedUserIds = JSON.parse(storedUserIds);
    }

    const storedPoints = localStorage.getItem('points');
    if (storedPoints) {
        points = parseInt(storedPoints, 10);
        pointsBox.textContent = points;
    }

    addPointsBtn.addEventListener('click', () => {
        addPointsModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        addPointsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == addPointsModal) {
            addPointsModal.style.display = 'none';
        }
    });

    addPointsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const userId = userIdInput.value.trim();

        let valid = true;
        let pointsToAdd = 0;

        if (!validateName(name)) {
            nameError.textContent = 'يجب إدخال اسمك ثلاثي';
            valid = false;
        } else {
            nameError.textContent = '';
        }

        if (!validatePhone(phone)) {
            phoneError.textContent = 'رقم الهاتف هذا غير صحيح';
            valid = false;
        } else {
            phoneError.textContent = '';
        }

        const userIdValidationResult = validateUserId(phone, userId);
        if (userIdValidationResult === "invalid") {
            userIdError.textContent = 'هذا اليوزر غير صحيح';
            valid = false;
        } else {
            userIdError.textContent = '';
            pointsToAdd = userIdValidationResult === "first" ? 10 : (userIdValidationResult === "second" ? 100 : 0);
        }

        if (usedUserIds[userId] && usedUserIds[userId] !== phone) {
            alert('هذا اليوزر تم استخدامه بالفعل من قبل رقم هاتف آخر');
            valid = false;
        }

        if (!valid) {
            return;
        }

        if (userIdValidationResult === "both") {
            let choice = prompt("Both User ID formats are correct. Enter '10' to add 10 points or '100' to add 100 points.");
            if (choice === '10') {
                pointsToAdd = 10;
            } else if (choice === '100') {
                pointsToAdd = 100;
            } else {
                alert('Invalid choice.');
                return;
            }
        }

        if (usedUserIds[userId] === phone) {
            alert('نفس رقم الهاتف واليوزر اي دي استخدما من قبل، لن تتم إضافة نقاط جديدة.');
        } else {
            usedUserIds[userId] = phone;
            points += pointsToAdd;
            localStorage.setItem('points', points.toString());
        }

        localStorage.setItem('usedUserIds', JSON.stringify(usedUserIds));

        pointsBox.textContent = points;
        addPointsModal.style.display = 'none';
        addPointsForm.reset();
    });

    document.querySelectorAll('.withdraw-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            if (points < 10) {
                alert('ليس لديك نقاط');
                return;
            }
            const confirmWithdraw = confirm(`هل انت متأكد من دخول السحب لـ ${event.target.dataset.device}?`);
            if (confirmWithdraw) {
                points -= 10;
                localStorage.setItem('points', points.toString());
                pointsBox.textContent = points;
                alert(`لقد تم دخول السحب بنجاح ${event.target.dataset.device}!`);
            }
        });
    });

    function validateName(name) {
        const syllables = name.split(/\s+/).length;
        return syllables >= 3;
    }

    function validatePhone(phone) {
        return /^(010|011|012|015)\d{8}$/.test(phone);
    }

    function validateUserId(phone, userId) {
        const fourthDigit = phone.charAt(3);
        const seventhDigit = phone.charAt(6);
        const fifthDigit = phone.charAt(4);
        const eighthDigit = phone.charAt(7);

        const validateWithS = (S) => {
            const firstExpectedUserId = `UserID${fourthDigit}${seventhDigit}${Math.pow(S, parseInt(fifthDigit)) + 931}`;
            const secondExpectedUserId = `UserID${fifthDigit}${eighthDigit}${Math.pow(S, parseInt(seventhDigit)) + 534}`;
            return { firstExpectedUserId, secondExpectedUserId };
        };

        for (let S = 2; S <= Number.MAX_SAFE_INTEGER; S++) {
            const { firstExpectedUserId, secondExpectedUserId } = validateWithS(S);
            if (userId === firstExpectedUserId && userId === secondExpectedUserId) {
                return "both";
            } else if (userId === firstExpectedUserId) {
                return "first";
            } else if (userId === secondExpectedUserId) {
                return "second";
            }
        }

        return "invalid";
    }
});

