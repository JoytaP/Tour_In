async function saveToWishlist(placeId) {

    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        alert('Faça login primeiro');
        return;
    }

    try {

        const response = await fetch(
            'http://localhost:3000/wishlist/add',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    place_id: placeId
                })
            }
        );

        const data = await response.json();

        if (data.success) {
            alert('Lugar salvo ❤️');
        } else {
            alert(data.error);
        }

    } catch (error) {
        console.error(error);
    }
}