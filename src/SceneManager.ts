import { Markup, BaseScene } from "telegraf";
import { TelegrafContext } from "telegraf/typings/context";
import { db }  from "./DateBase";
import IOrderManager from "./IOrderManager";
import {admin_username} from "./index";

const WizardScene = require("telegraf/scenes/wizard");

let admin_chat_id;

export class SceneManager {
	public startScene() {
		const start = new BaseScene("startbot");
		start.enter(async ctx => {
			if (ctx.from.username === admin_username) {
				admin_chat_id = ctx.chat.id;
				ctx.reply("Добро пожаловать в магазин!", Markup.keyboard([
					Markup.button("🛠Админ панель🛠")
				]).extra())
			} else {
				ctx.reply("Добро пожаловать в магазин!");
			}
			let products = db.getAll('products');
			console.log('PRODUCTS', products)
			if (products.length === 0) {
				ctx.telegram.sendMessage(ctx.chat.id, "У нас пока ещё нету продуктов :(");
			} else {
				for (let product of products){
					await ctx.telegram.sendMessage(ctx.chat.id, `Название: ${product[0]}\nЦена: ${product[1]} руб.`, Markup.inlineKeyboard([
						Markup.callbackButton("В корзину➡️🛒", "addToBasket"),
						Markup.callbackButton("Перейти в корзину👣🛒", "goToBasket")
					]).extra());
				}
			}
		});
		return start;
	}

	public adminPanel() {
		const adminPanel = new BaseScene("adminPanel");
		adminPanel.enter(async ctx => {
			let buttons = ["➕Добавить товар➕"];
			ctx.reply("Админ панель", Markup.keyboard(
				buttons.map(element => {
					return Markup.button(element);
				})).extra())
			adminPanel.on("text", async (ctx) => {
				if (ctx.message.text === "➕Добавить товар➕") {
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
				ctx.reply("Введите название товара", Markup.removeKeyboard().extra());
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
				db.adder("products", ctx.from.username, product_data[0], product_data[1], 0);
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
					ctx.reply("Корзина пустая⬛️");
					return ctx.scene.leave();
				} else {
					let content = this.getBasketData(ctx, "Корзина:\n\n");
					ctx.reply(content, Markup.inlineKeyboard([
						Markup.callbackButton("Оформить✅", "checkout"),
						Markup.callbackButton("Очистить❌", "clearBasket")
					]).extra())
				}
				return ctx.scene.leave();
			}
		)
	}

	public checkout() {
		const checkout =  new BaseScene("checkout");
		checkout.enter(async ctx => {
			// @ts-ignore
			db.adder("orders", ctx.from.username)
			console.log(db.getAll("orders"))
			let content = this.getBasketData(ctx, "Оплатите заказ 🏁. Ваш заказ:\n\n");
			ctx.reply(content, Markup.inlineKeyboard([
				Markup.callbackButton("Оплатил(а)", "final")
			]).extra());
		})
		return checkout;
	}

	public final() {
		const final = new BaseScene("final");
		final.enter(async ctx => {
			ctx.reply("Поздравляем! Заказ был успешно оплачен.✅");
			let content = this.getBasketData(ctx, `Пользователь (${ctx.from.username} | id: ${ctx.from.id}) оплатил заказ №${db.getter("orders", ctx.from.username)}\nКорзина заказа:\n`);
			ctx.telegram.sendMessage(admin_chat_id, content);
			ctx.scene.enter("startbot");
		})
		return final;
	}

	public getBasketData(ctx, content) {
		let basket = db.getAll("basket")[0][ctx.from.username];
		let names = [];
		for (let i of basket) {
			names.push(i[0]);
		}

		let counts = db.countBasketContent(ctx.from.username);
		console.log(counts)
		for (let i of basket) {
			if (counts[i[0]] > 1 && content.includes(i[0])) {
				continue;
			} else {
				content = `${content}${basket.indexOf(i) + 1}. ${i[0]} (${[i[2]]} шт) - ${i[1]}\n`;
			}
		}

		let total = 0;
		for (let i of basket) {
			for (let j = 0; j <= i[2] - 1; j ++) {
				total += parseInt(i[1].match(/\d/g).join(""));
			}
		}
		return `${content}\nИтог - ${total} руб.`
	}
}