const fetchOptions = {
    credentials: "include",
    headers: {
        "X-IG-App-ID": "936619743392459",
    },
    method: "GET",
};

let username = window.location.href.toString().split('/')[3];
let followersCount;
let followingCount;
let accountsWillBeCheck;
let accounts=0;
window.resolveInstaScriptPermissions = () => { };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function executeWithNotice(fn, ...args) {
    if (window.location.origin !== "https://www.instagram.com") {
        window.location.href = "https://www.instagram.com";
        console.clear();
        return;
    }
    const permission = new Promise(resolve => (window.resolveInstaScriptPermissions = resolve));
    await permission;
    return await fn(...args);
}

async function getUserInfo(){
    var spans = document.querySelectorAll('span._ac2a');
    followersCount = Number.parseInt(spans[1].textContent.toString().replace('.',''));
    followingCount = Number.parseInt(spans[2].textContent.toString().replace('.',''));
    accountsWillBeCheck = followersCount + followingCount;
}

const getInfo =()=>{
    let all = followersCount+followingCount;
    return (accounts/all*100).toFixed(2);
}
const concatFriendshipsApiResponse = async (
    list,
    user_id,
    count,
    next_max_id = ""
) => {
    let url = `https://www.instagram.com/api/v1/friendships/${user_id}/${list}/?count=${count}`;
    if (next_max_id) {
        url += `&max_id=${next_max_id}`;
    }

    const data = await fetch(url, fetchOptions).then((r) => r.json());
    accounts += data.users.length;
    if (data.next_max_id) {
        console.log(
            `Kontrol ediliyor ${getInfo()}%`
        );
        sleep(500)
        return data.users.concat(
            await concatFriendshipsApiResponse(list, user_id, count, data.next_max_id)
        );
    }
    return data.users;
};

const getFollowers = (user_id, count = 50, next_max_id = "") => {
    return concatFriendshipsApiResponse("followers", user_id, count, next_max_id);
};

const getFollowing = (user_id, count = 50, next_max_id = "") => {
    return concatFriendshipsApiResponse("following", user_id, count, next_max_id);
};

const getUserId = async (username) => {
    let user = username;

    const lower = user.toLowerCase();
    const url = `https://www.instagram.com/api/v1/web/search/topsearch/?context=blended&query=${lower}&include_reel=false`;
    const data = await fetch(url, fetchOptions).then((r) => r.json());

    const result = data.users?.find(
        (result) => result.user.username.toLowerCase() === lower
    );

    return result?.user?.pk || null;
};

const getUserFriendshipStats = async (username) => {

    const user_id = await getUserId(username);
    if (!user_id) {
        throw new Error(`${username} kullanıcı adına ait hesap bulunamadı.`);
    }
    const followers = await getFollowers(user_id);
    const following = await getFollowing(user_id);

    const followersUsernames = followers.map((follower) =>
        follower.username.toLowerCase()
    );
    const followingUsernames = following.map((followed) =>
        followed.username.toLowerCase()
    );

    const followerSet = new Set(followersUsernames);
    const followingSet = new Set(followingUsernames);
    console.log(`Kontrol ediliyor 100%`);
    console.log(`-------------------------------------> KILIÇDAROĞLU ADAY OLMASIN <-------------------------------------`);
    console.log(Array(28).fill("-").join(""));
    console.log(followerSet.size, `Takipçi ve `, followingSet.size, " takip edilen işleme alındı.");

    const takipEtmedigimTakipciler = Array.from(followerSet).filter(
        (follower) => !followingSet.has(follower)
    );

    const beniTakipEtmeyenTakipEttiklerim = Array.from(followingSet).filter(
        (following) => !followerSet.has(following)
    );

    return {
        takipEtmedigimTakipciler,
        beniTakipEtmeyenTakipEttiklerim,
    };
};



await getUserInfo();
executeWithNotice(getUserFriendshipStats, username).then(console.log);
resolveInstaScriptPermissions();

