import { Markup, BaseScene } from "telegraf";
const WizardScene = require("telegraf/scenes/wizard");
import { TelegrafContext } from "telegraf/typings/context";
import { db }  from "./DateBase";
const admin_id : string = process.env.TG_ADMIN_ID;

export class SceneManager {
	public startScene() {
		const start = new BaseScene("startbot");
		start.enter(async (ctx : TelegrafContext) => {
			let buttons = [];
			if (ctx.from.username === admin_id) buttons = buttons.concat(["Админ панель"]);
			let products = db.getAll('products');
			await ctx.reply("Добро пожаловать в магазин!", Markup.keyboard(
				buttons.map(element => {
					return Markup.button(element);
				})).extra())
			console.log('PRODUCTS', products)
			if (products.length === 0) {
				ctx.telegram.sendMessage(ctx.chat.id, "У нас пока ещё нету продуктов :(");
			} else {
				for (let product of products){
					await ctx.telegram.sendMessage(ctx.chat.id, `Название: ${product[0]}\nЦена: ${product[1]}`, Markup.inlineKeyboard([
						Markup.callbackButton("В корзину", "addToBasket"),
						Markup.callbackButton("Перейти в корзину", "goToBasket")
					]).extra());
				}
			}
			start.on("text", async (ctx) => {
				if (ctx.message.text === "Админ панель") {
					// @ts-ignore
					ctx.scene.enter("adminPanel");
				}
			})
		});
		return start;
	}

	public adminPanel() {
		const adminPanel = new BaseScene("adminPanel");
		adminPanel.enter(async (ctx : TelegrafContext) => {
			let buttons = ["Add product"];
			ctx.reply("Админ панель", Markup.keyboard(
				buttons.map(element => {
					return Markup.button(element);
				})).extra())
			adminPanel.on("text", async (ctx) => {
				if (ctx.message.text === "Add product") {
					// @ts-ignore
					ctx.scene.enter("addProduct");
				}
			})
		})
		return adminPanel;
	}

	public addProduct() {
		const product_data = [];
		return new WizardScene("addProduct",
			async ctx => {
				ctx.reply("Введите название товара");
				return ctx.wizard.next();
			},
			async ctx => {
				ctx.reply("Введите цену товара");
				product_data.push(ctx.message.text);
				return ctx.wizard.next();
			},
			async ctx => {
				product_data.push(ctx.message.text);
				console.log(product_data);
				db.adder("products", ctx.from.username, product_data[0], product_data[1]);
				product_data.length = 0;
				return ctx.scene.enter("startbot");
			}
		);
	}
	public goToBasket() {
		return new WizardScene("goToBasket",
			async ctx => {
				console.log(db.getAll("basket"));
				if (db.getAll("basket")[0][ctx.from.username] && db.getAll("basket")[0][ctx.from.username].length === 0) {
					ctx.reply("Корзина пустая");
					return ctx.scene.leave();
				} else {
					let content = "Корзина:\n\n";
					let basket = db.getAll("basket")[0][ctx.from.username];
					for (let i of basket) {
						content = `${content}${basket.indexOf(i) + 1}. ${i[0]} ${i[1]};\n`;
					}
					ctx.reply(content, Markup.inlineKeyboard([
						Markup.callbackButton("Оформить", "checkout"),
						Markup.callbackButton("Очистить", "clearBasket")
					]).extra())
				}
				return ctx.scene.leave();
			}
		)
	}
}