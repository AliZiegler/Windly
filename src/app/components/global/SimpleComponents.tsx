export default function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center p-4">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin">
            </div>
        </div>
    );
}
export type searchParamsType = Promise<
    Record<string, string | string[] | undefined>
>;
