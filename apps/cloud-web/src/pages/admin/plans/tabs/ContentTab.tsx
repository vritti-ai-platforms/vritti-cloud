import { useUpdatePlan } from '@hooks/admin/plans';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { RichTextEditor } from '@vritti/quantum-ui/RichTextEditor';
import { useEffect, useRef, useState } from 'react';
import type { Plan } from '@/schemas/admin/plans';

// Returns undefined if value is falsy or not valid JSON
function safeParse(value: string | null | undefined) {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

// Inline rich-text editor for plan content
export const ContentTab = ({ plan }: { plan: Plan }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<string | undefined>(plan.content ?? undefined);
  const contentInitialized = useRef(false);
  const [savedContent, setSavedContent] = useState<string | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMutation = useUpdatePlan();

  // Use savedContent (optimistic) until query cache catches up
  const displayContent = savedContent ?? plan.content;

  // Clear optimistic override once query cache syncs
  useEffect(() => {
    if (savedContent && plan.content === savedContent) {
      setSavedContent(undefined);
    }
  }, [plan.content, savedContent]);

  // Save the current editor state
  const handleSave = () => {
    updateMutation.mutate(
      { id: plan.id, data: { content: contentRef.current } },
      {
        onSuccess: () => {
          setSavedContent(contentRef.current);
          setIsEditing(false);
        },
      },
    );
  };

  // Discard changes and return to view mode
  const handleCancel = () => {
    contentRef.current = displayContent ?? undefined;
    contentInitialized.current = false;
    setIsEditing(false);
  };

  return (
    <div className="pt-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Plan Content</CardTitle>
            <CardDescription>Shown to users when selecting a plan.</CardDescription>
          </div>
          {isEditing ? (
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} loadingText="Saving..." isLoading={updateMutation.isPending}>
                Save
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {mounted ? (
            <RichTextEditor
              key={isEditing ? 'edit' : 'view'}
              editorSerializedState={safeParse(displayContent)}
              onSerializedChange={(state) => {
                if (!contentInitialized.current) {
                  contentInitialized.current = true;
                  return;
                }
                contentRef.current = JSON.stringify(state);
              }}
              contentOnly={!isEditing}
              placeholder="Add plan features, inclusions, and details..."
              className="border-0 shadow-none bg-muted/30 min-h-[400px]"
            />
          ) : (
            !displayContent && (
              <p className="text-sm text-muted-foreground">No content yet. Click Edit to add plan features.</p>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};
