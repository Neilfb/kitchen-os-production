import { Metadata } from 'next';

export type DynamicRouteParams<T extends Record<string, string>> = {
  params: T;
  searchParams?: { [key: string]: string | string[] | undefined };
};

export type PageMetadata = Metadata;
