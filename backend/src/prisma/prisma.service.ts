import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

// @Injectable()
// export class PrismaService {
//   prisma: PrismaClient;

//   constructor() {
//     this.prisma = new PrismaClient();
//   }

//   async onModuleDestroy() {
//     await this.prisma.$disconnect();
//   }
// }

@Injectable()
export class PrismaService extends PrismaClient {
	constructor(config: ConfigService) {
		super({
			datasources: {
				db: {
					url: config.get('DATABASE_URL'),
				},
			},
		});
		// console.log(config.get('DATABASE_URL'));
	}

	async onModuleDestroy() {
    	await this.$disconnect();
  	}

	// cleanDatabase() {
	// 	return this.$transaction([ //using the $transaction allows us to execute the deleteMany function first on bookmark, then on user. It is safier than not using it.
	// 		// this.bookmark.deleteMany(),
	// 		this.user.deleteMany(),
	// 	])
	// }
}
