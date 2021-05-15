import fetch from 'node-fetch'

interface User {
    token: string
    id: string
    count: string
}

vkAPI()

function vkAPI() {
    const [token, id, count] = getArgs().slice(2);
    const user: User = {token, id, count};

    showUsersFriends(user);
    showUsersSubscriptions(user);
}

function getArgs(): string[] {
    const args: string[] = process.argv;
    if (args === undefined || args.length < 5) {
        console.log("Введите свой access_token, id пользователя и количество позиций, которое нужно вернуть \n" +
            "ts-node vkAPI.ts [token] [id] [count]"
        );
        process.exit(1);
    }
    return args;
}

async function getDataResponse(url: string) {
    return await fetch(url, {method: 'GET'})
        .then(response => response.json())
        .then(response => {
            return (response === undefined) ?
                Promise.reject("ответ с сервера не был получен") :
                (response.response === undefined) ?
                    Promise.reject(`Код ошибки: ${response.error.error_code} Сообщение: ${response.error.error_msg}`) :
                    response.response
        })
}

function showUsersFriends(user: User) {
    getFriendsUrl(user)
        .then(userUrl => getDataResponse(userUrl))
        .then(response => getUsersInfo(response.items, response.count))
        .then(info => console.log(info))
        .catch(reject => console.log(reject));
}

function getFriendsUrl(user) {
    return Promise.resolve(`https://api.vk.com/method/friends.get?user_id=${user.id}&order=hints&count=${user.count}&fields=city&access_token=${user.token}&v=5.52`);
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
    getSubscriptionsUrl(user)
        .then(groupUrl => getDataResponse(groupUrl))
        .then(response => getSubscriptionsInfo(response.items, response.count))
        .then(info => console.log(info))
        .catch(reject => console.log(reject));
}

function getSubscriptionsUrl(user) {
    return Promise.resolve(`https://api.vk.com/method/users.getSubscriptions?user_id=${user.id}&extended=1&count=${user.count}&fields=name&access_token=${user.token}&v=5.52`);
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