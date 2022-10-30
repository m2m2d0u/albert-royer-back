import { Inject, Injectable, Logger } from "@nestjs/common";
import { SubTest, SubTestDocument } from "@entities";
import { SubTestAddDTO, TestResponse } from "@validations";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { QuizService } from "./quiz.service";
import { SubtestModel } from "@models";

@Injectable()
export class SubtestService {
  private readonly logger: Logger = new Logger(SubtestService.name);

  constructor(
    @InjectModel(SubTest.name)
    private subTestModel: Model<SubTestDocument>,
    @Inject(QuizService)
    private readonly quizService: QuizService
  ) {}

  async addSubtest(subTestDTO: SubTestAddDTO): Promise<SubTest> {
    const subTest: SubTest = new SubTest();
    subTest.name = subTestDTO.name;
    return new this.subTestModel(subTest).save();
  }

  async getAll() {
    const subTests: Array<SubTest> = await this.subTestModel.find();
    for (const subTest of subTests) {
      subTest.quiz = await this.quizService.getQuizzes(
        subTest.quiz.map(id => id.toString())
      );
    }
    return subTests.map(subtest => {
      const subtestModel = new SubtestModel(subtest);
      return subtestModel.getResource();
    });
  }

  async getByName(name: string) {
    const subTest: SubTest = await this.subTestModel.findOne({ name });
    subTest.quiz = await this.quizService.getQuizzes(
      subTest.quiz.map(id => id.toString())
    );
    const subTestModel: SubtestModel = new SubtestModel(subTest);
    return subTestModel.getResource();
  }

  async submitResponse(testResponse: TestResponse) {
    let resultFirstQuiz: number = 0;
    let resultSecondQuiz: number = 0;
    const firstQuiz = testResponse.firstQuiz;
    firstQuiz["data"].map(response => {
      const givingResponse = response["question"].filter(
        response => response.isActive === true
      )[0];
      if (givingResponse) {
        resultFirstQuiz =
          resultFirstQuiz + (givingResponse["sup"] - givingResponse["inf"]);
      }
    });
    const secondQuiz = testResponse.secondQuiz;
    const retrieveQuiz = await this.quizService.getQuiz(secondQuiz["id"]);
    secondQuiz["data"].map(response => {
      const nameQuestion = response["name"];
      const givingResponse = response["question"].filter(
        response => response.value === true
      )[0];
      const rightResponse = retrieveQuiz.listOfResponses.filter(
        response => response[nameQuestion]
      )[0];
      if (
        givingResponse &&
        givingResponse["title"] === rightResponse[nameQuestion]
      ) {
        resultSecondQuiz = resultSecondQuiz + 1;
      }
    });
    console.log(resultFirstQuiz);
    console.log(resultSecondQuiz);
    return "OK";
  }

  async getById(id: string) {
    const subTest: SubTest = await this.subTestModel.findById(id);
    subTest.quiz = await this.quizService.getQuizzes(
      subTest.quiz.map(id => id.toString())
    );
    const subTestModel: SubtestModel = new SubtestModel(subTest);
    return subTestModel.getResource();
  }
}
