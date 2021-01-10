import {
	Telegraf,
	Stage,
	session
} from "telegraf";
import { SceneManager } from "./SceneManager";
import { db }  from "./DateBase";

const token = process.env.BOT_TOKEN;
export const admin_username : string = process.env.TG_ADMIN_USERNAME;

if (token === undefined) {
	throw new Error('BOT_TOKEN must be provided!')
}
console.log("token using:", token);

const bot = new Telegraf(token);
const patternScene = new SceneManager();
const startScene = patternScene.startScene();
const adminPanel = patternScene.adminPanel();
const addProduct = patternScene.addProduct();
const goToBasket = patternScene.goToBasket();
const checkout = patternScene.checkout();
const final = patternScene.final();
const stage = new Stage([startScene, adminPanel, addProduct, goToBasket, checkout, final]);

bot.use(session());
bot.use(stage.middleware());
bot.command("start",ctx => {
	// @ts-ignore
	ctx.scene.enter("startbot");
});

bot.action("addToBasket", async ctx => {
	let product_name = ctx.callbackQuery.message.text.split('\n')[0].replace("Название: ", "");
	let product_price = ctx.callbackQuery.message.text.split('\n')[1].replace("Цена: ", "");
	let count = db.countBasketContent(ctx.from.username);
	console.log(count)
	if (count && Object.keys(count).join("|").includes(product_name)) {
		console.log( Object.keys(count).join("|"), "<<>>", product_name)
		let current;
		for (let el = 0; el <= Object.keys(count).length - 1; el++) {
			if (Object.keys(count)[el].includes(product_name)) {
				current = parseInt(Object.keys(count)[el].split(",")[2]) + 1;
			};
		}
		db.setAmount("basket", ctx.from.username, product_name, current);
	} else {
		db.adder("basket", ctx.from.username, product_name, product_price, 1);
	}
	ctx.telegram.sendMessage(ctx.chat.id, `${product_name} - ${product_price} успешно добавлен в корзину.`)
})
bot.hears("🛠Админ панель🛠", async ctx => {
	console.log(admin_username)
	if (typeof admin_username !== "undefined" && admin_username.includes(ctx.from.username)) {
		// @ts-ignore
		ctx.scene.enter("adminPanel");
	}
})
bot.action("clearBasket", async ctx => {
	db.clearBasket(ctx.from.username);
	ctx.editMessageText("Корзина очищена");
	// @ts-ignore
	ctx.scene.leave();
})
bot.action("goToBasket", async ctx => {
	// @ts-ignore
	ctx.scene.enter("goToBasket");
})
bot.action("checkout", async ctx => {
	// @ts-ignore
	ctx.scene.enter("checkout");
})
bot.action("final", async ctx => {
	// @ts-ignore
	ctx.scene.enter("final");
})
bot.launch();