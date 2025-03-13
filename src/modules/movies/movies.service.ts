import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Movie } from '@prisma/client';

@Injectable()
export class MoviesService {
  // URL base para consultas a TMDb
  private API_URL = 'https://api.themoviedb.org/3';
  // Clave de API de TMDb almacenada en variables de entorno
  private API_KEY = process.env.TMDB_API_KEY;

  constructor(private readonly httpService: HttpService) {}

  // Función que busca películas por título usando la API de TMDb
  async searchMoviesByTitle(title: string): Promise<Partial<Movie>[]> {
    try {
      // Realiza una petición GET a TMDb buscando por título
      const response = await firstValueFrom(
        this.httpService.get(`${this.API_URL}/search/movie`, {
          params: {
            api_key: this.API_KEY,
            query: title,
            language: 'es-ES',
          },
        }),
      );

      // Mapea los resultados al formato del modelo Movie definido en Prisma
      return response.data.results.map((movie) => ({
        tmdbId: movie.id,                               // ID de TMDb
        title: movie.title,                             // Título de la película
        genres: movie.genre_ids,                        // Géneros (array de IDs)
        overview: movie.overview,                       // Descripción breve
        posterPath: movie.poster_path || null,          // Ruta de la imagen del póster
        year: movie.release_date
          ? new Date(movie.release_date).getFullYear()  // Año de estreno
          : undefined,
        duration: movie.runtime || 0,                   // Duración (minutos), valor predeterminado 0
      }),
      );
    } catch (error) {
      // Maneja errores de petición HTTP lanzando una excepción clara para NestJS
      throw new HttpException(
        'Error al buscar películas en TMDb',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
