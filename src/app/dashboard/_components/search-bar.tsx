
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, SearchIcon } from 'lucide-react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Dispatch, SetStateAction, useEffect } from 'react';

const formSchema = z.object({
    query: z.string().min(0).max(200),
})

export function SearchBar({query, setQuery}: {query: string; setQuery: Dispatch<SetStateAction<string>>}){
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            query: "",
        }
    });
    
    async function onSubmit(values: z.infer<typeof formSchema>){
        setQuery(values.query);
    }

    useEffect(() => {
        form.setValue("query", query);
    }, [query, form]);

    return <div>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex gap-2 items-center"
                  >
                    <FormField
                      control={form.control}
                      name="query"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder='your file names'></Input>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={form.formState.isLoading} className="flex gap-2" size="sm">
                      {form.formState.isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin"/>
                      )}
                      <SearchIcon /> Search
                    </Button>
                  </form>
                </Form>
    </div>
}