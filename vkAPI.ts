import fetch from 'node-fetch'

interface User {
    token: string
    id: string
}

vkAPI()

function vkAPI() {
    const [token, id] = getArgs().slice(2);
    const user: User = {token, id};

    showUsersFriends(user);
    showUsersSubscriptions(user);
}

function getArgs(): string[] {
    const args: string[] = process.argv;
    if (args === undefined || args.length < 4) {
        console.log("Введите свой access_token и id пользователя\n" +
            "node vkAPI [key] [id] "
        );
        process.exit(1);
    }
    return args;
}

async function getDataResponse(url: string) {
    return await fetch(url, {method: 'GET'})
        .then(response => response.json())
        .then(response => response.response);
}

function showUsersFriends(user: User) {
    getFriendsUrl(user.token, user.id)
        .then(userUrl => getDataResponse(userUrl))
        .then(response => getUsersInfo(response.items, response.count))
        .then(info => console.log(info))
        .catch(reject => console.log(reject));
}

function getFriendsUrl(token, id) {
    return Promise.resolve(`https://api.vk.com/method/friends.get?user_id=${id}&order=hints&count=10&fields=city&access_token=${token}&v=5.52`);
}

function getUsersInfo(friends, count: number): string {
    let info = `Всего друзей: ${count}`;
    for (const friend of friends) {
        info += `
                Имя: ${friend.first_name} 
                Фамилия: ${friend.last_name}
                Город: ${friend.city?.title ?? "Неизвестно"}
                ссылка на страницу: https://vk.com/id${friend.id}
                `;
    }
    return info;
}

function showUsersSubscriptions(user: User) {
    getSubscriptionsUrl(user.token, user.id)
        .then(groupUrl => getDataResponse(groupUrl))
        .then(response => getSubscriptionsInfo(response.items, response.count))
        .then(info => console.log(info))
        .catch(reject => console.log(reject));
}

function getSubscriptionsUrl(token, id) {
    return Promise.resolve(`https://api.vk.com/method/users.getSubscriptions?user_id=${id}&extended=1&count=10&fields=name&access_token=${token}&v=5.52`);
}

function getSubscriptionsInfo(subscriptions, count) {
    let info = `Всего подписок пользователя: ${count}`;
    for (const subscription of subscriptions) {
        info += `
                Название группы: ${subscription.name}
                Ссылка на группу: https://vk.com/${subscription.screen_name}
                `;
    }
    return info;
}