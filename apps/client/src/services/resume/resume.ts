import { ResumeDto } from "@reactive-resume/dto";

import { db } from "@/client/db";
import { axios } from "@/client/libs/axios";

export const findResumeById = async (data: { id: string }) => {
  // const response = await axios.get<ResumeDto>(`/resume/${data.id}`);
  const result = await db.resumes.where("id").equals(data.id).first();
  return result;

  // return response.data;
};

export const findResumeByUsernameSlug = async (data: { username: string; slug: string }) => {
  const response = await axios.get<ResumeDto>(`/resume/public/${data.username}/${data.slug}`);

  return response.data;
};
